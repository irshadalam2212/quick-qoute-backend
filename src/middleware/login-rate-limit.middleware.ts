import type { RequestHandler } from "express";
import { createClient } from "redis";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apierror.js";

const redis = env.REDIS_URL ? createClient({ url: env.REDIS_URL }) : null;
let connectPromise: Promise<void> | undefined;

redis?.on("error", (error: Error) => {
  console.error("Rate-limit Redis error:", error.message);
});

const ensureRedisConnected = async () => {
  if (!redis) throw new Error("Rate-limit Redis is not configured");
  if (redis.isOpen) return;
  connectPromise ??= redis.connect().then(() => undefined).finally(() => {
    connectPromise = undefined;
  });
  await connectPromise;
};

// Increment and set the expiry atomically so concurrent requests and multiple
// API instances share one fixed window per client IP.
const INCREMENT_WITH_EXPIRY = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[1])
  end
  return count
`;

interface RateLimitOptions {
  name: string;
  windowMs: number;
  maxAttempts: number;
  limitMessage: string;
  unavailableMessage: string;
}

const createRateLimit = ({
  name,
  windowMs,
  maxAttempts,
  limitMessage,
  unavailableMessage,
}: RateLimitOptions): RequestHandler => {
  return async (req, _res, next) => {
    try {
      await ensureRedisConnected();
      if (!redis) throw new Error("Rate-limit Redis is not configured");
      const key = req.ip || req.socket.remoteAddress || "unknown";
      const count = await redis.eval(INCREMENT_WITH_EXPIRY, {
        keys: [`rate-limit:${name}:${key}`],
        arguments: [String(windowMs)],
      });
      if (Number(count) > maxAttempts) {
        throw new ApiError(429, limitMessage);
      }
      next();
    } catch (error) {
      if (error instanceof ApiError) return next(error);
      // Fail closed: don't let requests through unthrottled when the shared
      // store is unavailable.
      next(new ApiError(503, unavailableMessage));
    }
  };
};

export const loginRateLimit = createRateLimit({
  name: "login",
  windowMs: 15 * 60 * 1000,
  maxAttempts: 10,
  limitMessage: "Too many login attempts. Try again later.",
  unavailableMessage: "Login is temporarily unavailable.",
});

// Each registration can buffer two images, run bcrypt and upload to
// Cloudinary, so keep this much tighter than login.
export const registerRateLimit = createRateLimit({
  name: "register",
  windowMs: 60 * 60 * 1000,
  maxAttempts: 5,
  limitMessage: "Too many registration attempts. Try again later.",
  unavailableMessage: "Registration is temporarily unavailable.",
});

export const closeLoginRateLimitRedis = async (): Promise<void> => {
  if (redis?.isOpen) await redis.quit();
};
