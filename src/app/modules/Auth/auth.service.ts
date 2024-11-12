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

  if (isCorrectPassword) {
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
    console.log(accessToekn);
  }
};

export const authServices = {
  loginUserIntoDB,
};
