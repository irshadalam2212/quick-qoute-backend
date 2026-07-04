import prisma from "../lib/prisma.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponse.js";

const getAllUnits = asyncHandler(async (req, res) => {
  const units = await prisma.unit.findMany();

  if (!units || units.length === 0) {
    throw new ApiError(404, "No units found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, units, "Units retrieved successfully"));
});

export { getAllUnits };
