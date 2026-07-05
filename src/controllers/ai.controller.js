import { generateScopeDescription } from "../services/ai.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateDescription = asyncHandler(async (req, res) => {
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
