import { body, type ValidationChain } from "express-validator";

// Plain Prisma `String` columns are VARCHAR(191) on MySQL.
const VARCHAR_MAX = 191;
const TEXT_MAX = 2000;

const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_PATTERN = /^[A-Z]{5}\d{4}[A-Z]$/;

const nameRule = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters");

// Blank form fields arrive as "" in multipart bodies, so treat falsy as absent.
const optionalField = (field: string) =>
  body(field).optional({ values: "falsy" }).trim();

const mobileRule = (field: string, label: string) =>
  optionalField(field)
    .isMobilePhone("en-IN")
    .withMessage(`${label} must be a valid 10-digit Indian mobile number`);

// Shared by registration and profile updates so both enforce the same rules.
const companyProfileRules = (): ValidationChain[] => [
  optionalField("companyName")
    .isLength({ max: VARCHAR_MAX })
    .withMessage(`Company name must be at most ${VARCHAR_MAX} characters`),
  mobileRule("mobileNumber", "Mobile number"),
  mobileRule("alternateMobile", "Alternate mobile number"),
  optionalField("website")
    .isLength({ max: VARCHAR_MAX })
    .withMessage(`Website URL must be at most ${VARCHAR_MAX} characters`)
    .isURL()
    .withMessage("Website URL is not valid"),
  optionalField("gstNumber")
    .toUpperCase()
    .matches(GSTIN_PATTERN)
    .withMessage("GST number is not valid"),
  optionalField("panNumber")
    .toUpperCase()
    .matches(PAN_PATTERN)
    .withMessage("PAN number is not valid"),
  optionalField("services")
    .isLength({ max: TEXT_MAX })
    .withMessage(`Services must be at most ${TEXT_MAX} characters`),
  optionalField("address")
    .isLength({ max: TEXT_MAX })
    .withMessage(`Address must be at most ${TEXT_MAX} characters`),
];

const userRegisterValidator = (): ValidationChain[] => {
  return [
    // Personal Information
    nameRule(),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid"),

    // Never trim passwords: login compares the raw value.
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      // bcrypt ignores everything past 72 bytes.
      .isByteLength({ max: 72 })
      .withMessage("Password must be at most 72 bytes")
      .matches(/[A-Za-z]/)
      .withMessage("Password must contain at least one letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),

    // Company Information
    ...companyProfileRules(),
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
  nameRule(),
  ...companyProfileRules(),
];

export { userRegisterValidator, userLoginValidator, profileUpdateValidator };
