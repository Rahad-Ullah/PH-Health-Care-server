import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { scheduleServices } from "./schedule.service";

const createSchedule = catchAsync(async (req, res) => {
  const result = await scheduleServices.createScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

export const scheduleControllers = {
  createSchedule,
};
