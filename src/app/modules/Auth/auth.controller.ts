import catchAsync from "../../../shared/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { authServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUserIntoDB(req.body);

  const { refreshToekn } = result;
  res.cookie("refreshToken", refreshToekn, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToekn,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

export const authControllers = {
  loginUser,
};
