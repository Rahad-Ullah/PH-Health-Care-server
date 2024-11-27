import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";

const createAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await AppointmentServices.createAppointmentIntoDB(
      req.user as TAuthUser,
      req.body
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Appointment created successfully",
      data: result,
    });
  }
);

export const AppointmentControllers = {
  createAppointment,
};
