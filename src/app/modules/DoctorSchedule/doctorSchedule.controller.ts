import { Request } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import { TAuthUser } from "../../interfaces/common";

const createDoctorSchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
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
  }
);

export const DoctorScheduleControllers = {
  createDoctorSchedule,
};
