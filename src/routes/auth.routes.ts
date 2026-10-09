import { Router } from "express";
import {
  guestLogin,
  login,
  logout,
  refreshAccessToken,
  registerUser,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  userRegisterValidator,
  userLoginValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  registerUpload,
  requireMultipart,
} from "../middleware/multer.middleware.js";
import {
  loginRateLimit,
  registerRateLimit,
} from "../middleware/login-rate-limit.middleware.js";

const router = Router();

//public routes
router
  .route("/register")
  .post(
    // Throttle before multer so rejected requests never buffer uploads.
    registerRateLimit,
    requireMultipart,
    // Images are checked in the service so a bad file never blocks sign-up.
    registerUpload.fields([
      {
        name: "logo",
        maxCount: 1,
      },
      {
        name: "signature",
        maxCount: 1,
      },
    ]),
    userRegisterValidator(),
    validate,
    registerUser
  );
router.route("/login").post(loginRateLimit, userLoginValidator(), validate, login);
router.route("/guest-login").post(guestLogin);
router.route("/refresh-token").post(refreshAccessToken);

//secure auth routes
router.route("/logout").post(verifyJWT, logout);

export default router;

