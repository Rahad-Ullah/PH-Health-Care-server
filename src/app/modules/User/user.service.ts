import {
  Admin,
  Doctor,
  Patient,
  Prisma,
  UserRole,
  UserStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { fileUploader } from "../../../utils/fileUploader";
import { Request } from "express";
import { IUploadedFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../../utils/pagination";
import { userSearchableFields } from "./user.constant";

// create admin
const createAdminIntoDB = async (req: Request): Promise<Admin> => {
  const file = req.file as IUploadedFile;

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
const createDoctorIntoDB = async (req: Request): Promise<Doctor> => {
  const file = req.file as IUploadedFile;

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

// create patient
const createPatientIntoDB = async (req: Request): Promise<Patient> => {
  const file = req.file as IUploadedFile;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadToCloudinary?.secure_url;
  }

  // check if the user is already exist
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.patient.email,
    },
  });
  if (user) {
    throw new ApiError(StatusCodes.CONFLICT, "Patient already exists");
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);

  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: req.body.patient,
    });

    return createdPatientData;
  });

  return result;
};

// get all users
const getAllUsersFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const conditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    conditions.push({
      OR: userSearchableFields.map((value) => ({
        [value]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      // get relational data
      admin: true,
      patient: true,
      doctor: true,
    },
    // include: {
    //   admin: true,
    //   patient: true,
    //   doctor: true,
    // },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// change user status
const changeUserStatusIntoDB = async (
  id: string,
  payload: { status: UserStatus }
) => {
  // check if user is exist
  const userData = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!userData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User not exist");
  }

  // update user status
  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return updateUserStatus;
};

const getMyProfileFromDB = async (user: any) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === "SUPER_ADMIN" || "ADMIN") {
    profileInfo = await prisma.admin.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo.role === "DOCTOR") {
    profileInfo = await prisma.doctor.findUnique({
      where: { email: userInfo.email },
    });
  } else if (userInfo.role === "PATIENT") {
    profileInfo = await prisma.patient.findUnique({
      where: { email: userInfo.email },
    });
  }

  return { ...userInfo, ...profileInfo };
};

const updateMyProfile = async (user, payload) => {
  // check if the user exists
  const userInfo = await prisma.user.findUnique({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });
  if (!userInfo) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User does not exists");
  }

  // update user profile based on their role
  let updatedData;
  if (userInfo.role === "SUPER_ADMIN" || "ADMIN") {
    updatedData = await prisma.admin.update({
      where: { email: user.email },
      data: payload,
    });
  } else if (userInfo.role === "DOCTOR") {
    updatedData = await prisma.doctor.update({
      where: { email: user.email },
      data: payload,
    });
  } else if (userInfo.role === "PATIENT") {
    updatedData = await prisma.doctor.update({
      where: { email: user.email },
      data: payload,
    });
  }

  return updatedData;
};

export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUsersFromDB,
  changeUserStatusIntoDB,
  getMyProfileFromDB,
  updateMyProfile,
};
