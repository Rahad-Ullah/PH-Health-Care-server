import { Request, Response } from "express";
import { userService } from "./user.service";
import { sendResponse } from "../../../utils/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { TAuthUser } from "../../interfaces/common";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdminIntoDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createDoctorIntoDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createPatientIntoDB(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

// get all users
const getAllUsers = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await userService.getAllUsersFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

// change profile status
const changeProfileStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await userService.changeUserStatusIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status changed successfully",
    data: result,
  });
});

// get profile info
const getMyProfile = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await userService.getMyProfileFromDB(req.user as TAuthUser);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile retrieved successfully",
      data: result,
    });
  }
);

// update profile
const updateMyProfile = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await userService.updateMyProfile(
      req.user as TAuthUser,
      req
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User profile updated successfully",
      data: result,
    });
  }
);

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUsers,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
