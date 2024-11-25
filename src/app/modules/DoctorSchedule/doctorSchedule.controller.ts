import { Request } from "express";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { DoctorScheduleServices } from "./doctorSchedule.service";
import { TAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";
import { StatusCodes } from "http-status-codes";

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

const getMySchedules = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, [
      "startDateTime",
      "endDateTime",
      "isBooked",
    ]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await DoctorScheduleServices.getMySchedulesFromDB(
      filters,
      options,
      req.user as TAuthUser
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedules retrieved successfully",
      data: result,
    });
  }
);

export const DoctorScheduleControllers = {
  createDoctorSchedule,
  getMySchedules,
};
