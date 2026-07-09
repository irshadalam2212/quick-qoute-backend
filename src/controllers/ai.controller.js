import { generateScopeDescription } from "../services/ai.service.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";

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
