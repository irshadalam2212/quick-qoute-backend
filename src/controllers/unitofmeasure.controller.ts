import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { unitService } from "../services/unit.service.js";

const getAllUnits = asyncHandler(async (_req, res) => {
  const units = await unitService.list();
  return res
    .status(200)
    .json(new ApiResponse(200, units, "Units retrieved successfully"));
});

export { getAllUnits };
