import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await DoctorScheduleServices.createDoctorScheduleIntoDB(
    user,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor Schedule created successfully",
    data: result,
  });
});

export const DoctorScheduleControllers = {
  createDoctorSchedule,
};
