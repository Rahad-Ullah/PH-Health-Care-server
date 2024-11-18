import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../utils/jwtHelper";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { JwtPayload, Secret } from "jsonwebtoken";
import emailSender from "./emailSender";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password incorrect");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
      status: userData.status,
    },
    config.jwt.jwt_secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as string
    );
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
      status: userData.status,
    },
    "abcdefgh",
    "1h"
  );
  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

// change password
const changePassword = async (user: JwtPayload, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Password incorrect");
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      email: userData.email,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

// forgot password
const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPassToken = jwtHelpers.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as string,
    config.jwt.reset_pass_expires_in as string
  );
  const resetPassLink = `${config.reset_pass_link}?id=${userData.id}&token${resetPassToken}`;

  await emailSender(
    userData.email,
    `
    <div>
      <p>Dear User,</p>
      <p>Your password reset link
        <a href=${resetPassLink}>
          <button>Reset Password</button>
        </a>
      </p>
    </div>
    `
  );

  console.log(resetPassLink);
};

export const authServices = {
  loginUserIntoDB,
  refreshToken,
  changePassword,
  forgotPassword,
};
