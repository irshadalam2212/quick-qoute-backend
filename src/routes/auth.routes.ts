import { Router } from "express";
import {
  getCurrentUser,
  getUsers,
  guestLogin,
  login,
  logout,
  refreshAccessToken,
  registerUser,
  updateProfile,
} from "../controllers/auth.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  profileUpdateValidator,
  userRegisterValidator,
  userLoginValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

//public routes
router
  .route("/register")
  .post(
    upload.fields([
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
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/guest-login").post(guestLogin);
router.route("/refresh-token").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT, logout);
router.route("/profile").get(verifyJWT, getCurrentUser);
router.route("/users").get(verifyJWT, getUsers);
router
  .route("/update-profile")
  .put(
    verifyJWT,
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "signature", maxCount: 1 },
    ]),
    profileUpdateValidator(),
    validate,
    updateProfile,
  );

export default router;
