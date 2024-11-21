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
  const { specialities, ...doctorData } = payload;

  // check if doctor is exists
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Doctor does not exist");
  }

  await prisma.$transaction(async (txClient) => {
    // update doctor data
    await txClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (specialities && specialities.length > 0) {
      // delete specialities
      const deletedSpecialities = specialities.filter(
        (speciality: any) => speciality.isDeleted
      );

      for (const speciality of deletedSpecialities) {
        // check if the specialty is exist
        await txClient.specialities.findUniqueOrThrow({
          where: {
            id: speciality.specialityId,
          },
        });
        // delete specialities
        await txClient.doctorSpecialities.deleteMany({
          where: {
            doctorId: doctor.id,
            specialitiesId: speciality.specialityId,
          },
        });
      }

      // create specialities
      const createdSpecialities = specialities.filter(
        (speciality: any) => !speciality.isDeleted
      );

      for (const speciality of createdSpecialities) {
        // check if the specialty is exist
        await txClient.specialities.findUniqueOrThrow({
          where: {
            id: speciality.specialityId,
          },
        });
        // delete specialities
        await txClient.doctorSpecialities.create({
          data: {
            doctorId: doctor.id,
            specialitiesId: speciality.specialityId,
          },
        });
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id: doctor.id,
    },
    include: {
      doctorSpecialities: {
        include: {
          specialities: true,
        },
      },
    },
  });

  return result;
};

const softDeleteDoctorFromDB = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Doctor does not exists");
  }

  const result = await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

const deleteDoctorFromDB = async (id: string) => {
  // check if the doctor exists
  const doctorData = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  if (!doctorData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Doctor does not exists");
  }

  const result = await prisma.$transaction(async (txClient) => {
    // delete from doctor specialities table
    await txClient.doctorSpecialities.deleteMany({
      where: {
        doctorId: id,
      },
    });

    // delete from doctor table
    const deletedDoctor = await txClient.doctor.delete({
      where: {
        id,
      },
    });

    // delete from user table
    await txClient.user.delete({
      where: {
        email: doctorData.email,
      },
    });

    return deletedDoctor;
  });

  return result;
};

export const doctorServices = {
  getAllDoctorsFromDB,
  getDoctorByIdFromDB,
  updateDoctorIntoDB,
  softDeleteDoctorFromDB,
  deleteDoctorFromDB,
};
