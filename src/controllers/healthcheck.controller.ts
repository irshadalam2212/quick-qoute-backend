import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const healthCheck = asyncHandler(async (_req, res) => {
  res.status(200).json(new ApiResponse(200));
});
export { healthCheck };
