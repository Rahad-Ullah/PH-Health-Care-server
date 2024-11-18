import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { authServices } from "./auth.service";
import { Request, Response } from "express";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  const { refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token successful",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.changePassword(req.user, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);

const forgotPassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await authServices.forgotPassword(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);

export const authControllers = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
};
