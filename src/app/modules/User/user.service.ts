import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const createAdminIntoDB = async (data: any) => {
  // check if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      email: data.admin.email,
    },
  });
  if (user) {
    throw new ApiError(StatusCodes.CONFLICT, "Admin already exists");
  }

  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    email: data.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: data.admin,
    });

    return createdAdminData;
  });

  return result;
};

export const userService = {
  createAdminIntoDB,
};
