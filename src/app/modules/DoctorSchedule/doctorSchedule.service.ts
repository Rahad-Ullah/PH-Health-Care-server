import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IPaginationOptions } from "../../interfaces/pagination";
import { TAuthUser } from "../../interfaces/common";
import { calculatePagination } from "../../../utils/pagination";
import { Prisma } from "@prisma/client";

const createDoctorScheduleIntoDB = async (
  user: any,
  payload: { scheduleIds: string[] }
) => {
  // check if doctor exists
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email },
  });

  // check if schedule ids is valid
  for (const scheduleId of payload.scheduleIds) {
    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });
    if (!schedule) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Schedule ID '${scheduleId}' does not exist`
      );
    }
  }

  // make doctor schedule list
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctor.id,
    scheduleId,
  }));

  // create into database
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });

  return result;
};

const getMySchedulesFromDB = async (
  params: any,
  options: IPaginationOptions,
  user: TAuthUser
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { startDateTime, endDateTime, ...filterData } = params;

  const andConditions = [];

  // filter if startDateTime and endDateTime specified
  if (startDateTime && endDateTime) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDateTime,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDateTime,
            },
          },
        },
      ],
    });
  }

  andConditions.push({
    doctor: {
      email: user?.email,
    },
  });

  // filter if filter data specified
  if (Object.keys(filterData).length > 0) {
    // convert filter data to boolean type
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }

    // push to andcondition array
    andConditions.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: (filterData as any)[field],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // execute query
  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      schedule: {
        startDateTime: (sortOrder as Prisma.SortOrder) || "asc",
      },
    },
    include: {
      schedule: true,
    },
  });

  // count total
  const total = await prisma.doctorSchedules.count({
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

const getAllSchedulesFromDB = async (
  params: any,
  options: IPaginationOptions,
  user: TAuthUser
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions = [];

  // filter if startDateTime and endDateTime specified
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          doctor: {
            name: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
        {
          doctor: {
            email: {
              contains: searchTerm,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      ],
    });
  }

  // filter if filter data specified
  if (Object.keys(filterData).length > 0) {
    // convert filter data to boolean type
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }

    // push to andcondition array
    andConditions.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: (filterData as any)[field],
        },
      })),
    });
  }

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // execute query
  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      schedule: {
        startDateTime: (sortOrder as Prisma.SortOrder) || "asc",
      },
    },
    include: {
      schedule: true,
    },
  });

  // count total
  const total = await prisma.doctorSchedules.count({
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

const deleteScheduleFromDB = async (user: TAuthUser, scheduleId: string) => {
  // check if the doctor is exists
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // check if the schedule is exists
  await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });

  // check if the schedule is already booked
  const isScheduleBooked = await prisma.doctorSchedules.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
      isBooked: true,
    },
  });
  if (isScheduleBooked) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to delete! The schedule is already booked."
    );
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });

  return result;
};

export const DoctorScheduleServices = {
  createDoctorScheduleIntoDB,
  getMySchedulesFromDB,
  getAllSchedulesFromDB,
  deleteScheduleFromDB,
};
