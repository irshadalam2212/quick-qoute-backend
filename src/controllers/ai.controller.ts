import type { ParamsDictionary } from "express-serve-static-core";
import { generateScopeDescription } from "../services/ai.service.js";
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
