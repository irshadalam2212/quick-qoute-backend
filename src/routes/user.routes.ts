import { Router } from "express";
import {
  getCurrentUser,
  getUsers,
  updateProfile,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  upload,
  verifyImageUploads,
} from "../middleware/multer.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import { profileUpdateValidator } from "../validators/index.js";

const router = Router();

router
  .route("/profile")
  .get(verifyJWT, getCurrentUser)
  .put(
    verifyJWT,
    upload.fields([
      { name: "logo", maxCount: 1 },
      { name: "signature", maxCount: 1 },
    ]),
    verifyImageUploads,
    profileUpdateValidator(),
    validate,
    updateProfile,
  );
router.route("/users").get(verifyJWT, getUsers);

export default router;
