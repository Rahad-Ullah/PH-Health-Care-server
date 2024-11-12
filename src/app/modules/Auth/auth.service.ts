import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import { jwtHelpers } from "../../../utils/jwtHelper";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";

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
    throw new Error("Password incorrect`");
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

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    "abcdefghijkl",
    "30d"
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
    decodedData = jwtHelpers.verifyToken(token, "abcdefghijkl");
  } catch (error) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userData) {
    throw new Error("You are not authorized!");
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

export const authServices = {
  loginUserIntoDB,
  refreshToken,
};
