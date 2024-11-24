import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { ISchedule } from "./schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../../utils/pagination";
import { TAuthUser } from "../../interfaces/common";

const createScheduleIntoDB = async (
  payload: ISchedule
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const slotInterval = 30;

  const schedules = []; //  all schedules is stored here and we return a list of schedules

  const currentDate = new Date(startDate); // start date
  const lastDate = new Date(endDate); // end date

  // loop for date range
  while (currentDate <= lastDate) {
    // add hour-minute with date
    const startDateTime = new Date(
      addMinutes(
        addHours(
          format(currentDate, "yyyy-MM-dd"),
          Number(startTime.split(":")[0])
        ),
        Number(startTime.split(":")[1])
      )
    );
    // add hour-minute with date
    const endDateTime = new Date(
      addMinutes(
        addHours(
          format(currentDate, "yyyy-MM-dd"),
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    // loop for time range
    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, slotInterval),
      };

      // check if schedule already exists in the database
      const isScheduleExists = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });
      // create schedule if it doesn't exist
      if (!isScheduleExists) {
        // create schedule in DB
        const result = await prisma.schedule.create({
          data: scheduleData,
        });

        // push to schedules array
        schedules.push(result);
      }

      // increase start time by interval
      startDateTime.setMinutes(startDateTime.getMinutes() + slotInterval);
    }

    // increase current date by 1
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // return schedule list
  return schedules;
};

const getAllSchedulesFromDB = async (
  params: any,
  options: IPaginationOptions,
  user: TAuthUser
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { startDateTime, endDateTime, ...filterData } = params;
  console.log(startDateTime, endDateTime);
  console.log(startDateTime, endDateTime);

  const andConditions = [];

  if (startDateTime && endDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDateTime,
          },
        },
        {
          endDateTime: {
            lte: endDateTime,
          },
        },
      ],
    });
  }

  // filter if filter data specified
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((field) => ({
        [field]: {
          equals: (filterData as any)[field],
        },
      })),
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  console.log(doctorSchedules);

  // execute query
  const result = await prisma.schedule.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  // count total
  const total = await prisma.schedule.count({
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

export const scheduleServices = {
  createScheduleIntoDB,
  getAllSchedulesFromDB,
};
