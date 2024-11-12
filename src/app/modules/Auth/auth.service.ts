import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect`");
  }

  const accessToekn = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
      status: userData.status,
    },
    "abcdefgh",
    {
      expiresIn: "12 hours",
    }
  );

  const refreshToekn = jwt.sign(
    {
      email: userData.email,
      role: userData.role,
    },
    "abcdefgh",
    {
      expiresIn: "30d",
    }
  );

  return {
    accessToekn,
    refreshToekn,
    needPasswordChange: userData.needPasswordChange,
  };
};

export const authServices = {
  loginUserIntoDB,
};
