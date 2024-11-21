import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { doctorServices } from "./doctor.service";

const getDoctorById = catchAsync(async (req, res) => {
  const result = await doctorServices.getDoctorByIdFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully",
    data: result,
  });
});

export const doctorControllers = {
  getDoctorById,
};
