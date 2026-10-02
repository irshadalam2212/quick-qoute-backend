import { body, type ValidationChain } from "express-validator";

const userRegisterValidator = (): ValidationChain[] => {
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

const userLoginValidator = (): ValidationChain[] => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const profileUpdateValidator = (): ValidationChain[] => [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("companyName").optional({ values: "falsy" }).trim(),
  body("mobileNumber").optional({ values: "falsy" }).trim(),
  body("alternateMobile").optional({ values: "falsy" }).trim(),
  body("website")
    .optional({ values: "falsy" })
    .trim()
    .isURL()
    .withMessage("Website URL is not valid"),
  body("gstNumber").optional({ values: "falsy" }).trim(),
  body("panNumber").optional({ values: "falsy" }).trim(),
  body("services").optional({ values: "falsy" }).trim(),
  body("address").optional({ values: "falsy" }).trim(),
];

export { userRegisterValidator, userLoginValidator, profileUpdateValidator };
