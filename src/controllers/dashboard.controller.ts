import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { getAuthUser } from "../utils/auth.js";
import { dashboardService } from "../services/dashboard.service.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getMetrics(getAuthUser(req).id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, metrics, "Dashboard metrics fetched successfully!"),
    );
});
