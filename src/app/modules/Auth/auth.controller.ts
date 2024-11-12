import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { authServices } from "./auth.service";

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
    message: "Login successful",
    data: result,
    // data: {
    //   accessToken: result.accessToken,
    //   needPasswordChange: result.needPasswordChange,
    // },
  });
});

export const authControllers = {
  loginUser,
  refreshToken,
};
