import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
/**
 * 
const healthCheck = (req, res, next) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, { message: "Server is running" }));
  } catch (error) {
   next(err)
    console.log("Something went wrong", error);
  }
};
 */

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "Server is running" }));
});
export { healthCheck };
