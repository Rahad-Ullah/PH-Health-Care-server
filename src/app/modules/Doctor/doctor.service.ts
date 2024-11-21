import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { calculatePagination } from "../../../utils/pagination";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IDoctorFilterRequest } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constant";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const getAllDoctorsFromDB = async (
  params: IDoctorFilterRequest,
  options: IPaginationOptions
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const whereConditions: Prisma.DoctorWhereInput[] = [];

  // filter if search term specified
  if (searchTerm) {
    whereConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // filter if filter data specified
  if (Object.keys(filterData).length > 0) {
    whereConditions.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: (filterData as any)[field],
        },
      })),
    });
  }

  // filter non deleted items
  whereConditions.push({
    isDeleted: false,
  });

  // execute query
  const result = await prisma.doctor.findMany({
    where: { AND: whereConditions } as Prisma.DoctorWhereInput,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  // count total
  const total = await prisma.doctor.count({
    where: { AND: whereConditions } as Prisma.DoctorWhereInput,
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

const getDoctorByIdFromDB = async (id: string) => {
  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
};

const updateDoctorIntoDB = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  // check if doctor is exists
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Doctor does not exist");
  }

  // update the doctor and create his specialties by transaction
  const result = await prisma.$transaction(async (txClient) => {
    const updatedDoctorData = await txClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
      include: {
        doctorSpecialities: true,
      },
    });

    for (const specialitiesId of specialties) {
      // check if the specialty is exist
      const isSpecialityExist = await txClient.specialities.findUnique({
        where: {
          id: specialitiesId,
        },
      });
      if (!isSpecialityExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Invalid specialty ID");
      }

      // create a new speciality
      await txClient.doctorSpecialities.create({
        data: {
          doctorId: doctor.id,
          specialitiesId: specialitiesId,
        },
      });
    }

    return updatedDoctorData;
  });

  return result;
};

export const doctorServices = {
  getAllDoctorsFromDB,
  getDoctorByIdFromDB,
  updateDoctorIntoDB,
};
