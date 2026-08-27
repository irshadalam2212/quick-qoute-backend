import { body } from "express-validator";

export const userRegisterValidator = () => {
  return [
    // Personal Information
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid")
      .normalizeEmail(),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),

    // Company Information
    body("companyName")
      .optional()
      .trim(),

    body("mobileNumber")
      .optional()
      .trim(),

    body("alternateMobile")
      .optional()
      .trim(),

    body("website")
      .optional()
      .trim()
      .isURL()
      .withMessage("Website URL is not valid"),

    body("gstNumber")
      .optional()
      .trim(),

    body("panNumber")
      .optional()
      .trim(),

    body("services")
      .optional()
      .trim(),

    body("address")
      .optional()
      .trim(),

    // Branding
    body("logo")
      .optional()
      .trim(),

    body("signature")
      .optional()
      .trim(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

export { userRegisterValidator, userLoginValidator };
