import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { scheduleServices } from "./schedule.service";
import pick from "../../../shared/pick";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

const createSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, ["startDateTime", "endDateTime"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await scheduleServices.getAllSchedulesFromDB(
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


const deleteSchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {

    
    const result = await scheduleServices.deleteScheduleFromDB(
      req.user as TAuthUser,
      req.params.id
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Schedule deleted successfully",
      data: result,
    });
  }
);

export const scheduleControllers = {
  createSchedule,
  getAllSchedules,
  deleteSchedule,
};
