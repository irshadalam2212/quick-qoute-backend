import type { SafeUser } from "../types/user.js";
import { ApiError } from "./apierror.js";

/** Returns the user attached by `verifyJWT`, or throws 401 if the route is unauthenticated. */
export const getAuthUser = (req: { user?: SafeUser }): SafeUser => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  return req.user;
};
