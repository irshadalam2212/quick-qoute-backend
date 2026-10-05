import type { RequestHandler } from "express";
import { createClient } from "redis";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apierror.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const redis = env.REDIS_URL ? createClient({ url: env.REDIS_URL }) : null;
let connectPromise: Promise<void> | undefined;

redis?.on("error", (error) => {
  console.error("Login rate-limit Redis error:", error.message);
});

const ensureRedisConnected = async () => {
  if (!redis) throw new ApiError(503, "Login is temporarily unavailable.");
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

export const loginRateLimit: RequestHandler = async (req, _res, next) => {
  try {
    await ensureRedisConnected();
    if (!redis) throw new ApiError(503, "Login is temporarily unavailable.");
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const count = await redis.eval(INCREMENT_WITH_EXPIRY, {
      keys: [`rate-limit:login:${key}`],
      arguments: [String(WINDOW_MS)],
    });
    if (Number(count) > MAX_ATTEMPTS) {
      throw new ApiError(429, "Too many login attempts. Try again later.");
    }
    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    // Fail closed: don't allow password guesses through when the shared store
    // is unavailable, because this limiter protects the login endpoint.
    next(new ApiError(503, "Login is temporarily unavailable."));
  }
};

export const closeLoginRateLimitRedis = async (): Promise<void> => {
  if (redis?.isOpen) await redis.quit();
};
