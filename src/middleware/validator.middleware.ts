import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/apierror.js";

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    [err.type === "field" ? err.path : err.type]: err.msg,
  }));

  throw new ApiError(422, "Received data is not valid", extractedErrors);
};
