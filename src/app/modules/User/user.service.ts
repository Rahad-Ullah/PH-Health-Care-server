import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { fileUploader } from "../../../utils/fileUploader";

const createAdminIntoDB = async (req: any) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  // check if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.admin.email,
    },
  });
  if (user) {
    throw new ApiError(StatusCodes.CONFLICT, "Admin already exists");
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};


// create doctor
const createDoctorIntoDB = async (req: any) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  // check if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.doctor.email,
    },
  });
  if (user) {
    throw new ApiError(StatusCodes.CONFLICT, "Doctor already exists");
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB
};
