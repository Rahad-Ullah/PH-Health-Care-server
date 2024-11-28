import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { AppointmentServices } from "./appointment.service";
import { Request } from "express";
import { TAuthUser } from "../../interfaces/common";
import pick from "../../../shared/pick";

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

// get my appointment
const getMyAppointment = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AppointmentServices.getMyAppointmentFromDB(
      req.user as TAuthUser,
      filters,
      options
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Appointments retrieved successfully",
      data: result,
    });
  }
);

export const AppointmentControllers = {
  createAppointment,
  getMyAppointment,
};
