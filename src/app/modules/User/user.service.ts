import { Admin, Doctor, Patient, Prisma, UserRole } from "@prisma/client";
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

export const userService = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUsersFromDB,
};
