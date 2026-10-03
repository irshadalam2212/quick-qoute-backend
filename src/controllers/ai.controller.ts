import type { ParamsDictionary } from "express-serve-static-core";
import {
  generateScopeDescription,
  isConstructionRelated,
  UNRELATED_SCOPE_RESPONSE,
} from "../services/ai.service.js";
import type { GenerateDescriptionBody } from "../types/api.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const generateDescription = asyncHandler<
  ParamsDictionary,
  GenerateDescriptionBody
>(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt?.trim()) {
    throw new ApiError(400, "Prompt is required.");
  }

  if (!(await isConstructionRelated(prompt))) {
    throw new ApiError(422, UNRELATED_SCOPE_RESPONSE);
  }

  const description = await generateScopeDescription(prompt);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { description },
        "Description generated successfully.",
      ),
    );
});
