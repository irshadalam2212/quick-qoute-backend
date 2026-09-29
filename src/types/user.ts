import type { User } from "@prisma/client";

/** User record with credentials stripped, as attached to `req.user`. */
export type SafeUser = Omit<User, "password" | "refreshToken">;
