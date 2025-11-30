import { Router } from "express";
import {
  getCurrentUser,
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

const router = Router();

//public routes
router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, login);
router.route("/refresh-token").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT, logout);
router.route("/current-user").post(verifyJWT, getCurrentUser);

export default router;
