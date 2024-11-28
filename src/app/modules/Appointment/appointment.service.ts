import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuid4 } from "uuid";
import { IPaginationOptions } from "../../interfaces/pagination";
import { calculatePagination } from "../../../utils/pagination";
import { Prisma, UserRole } from "@prisma/client";

const createAppointmentIntoDB = async (
  user: TAuthUser,
  payload: { doctorId: string; scheduleId: string }
) => {
  // check if the patient exists
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  // check if the doctor exists
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  // check if the doctor schedule exists
  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  // generate unique id for video calling
  const videoCallingId: string = uuid4();

  // create a new appointment
  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    const today = new Date();
    const transactionId = `PH-Health-Care-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${today.getHours()}-${today.getMinutes()}`;

    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  return result;
};

// get my appointment
const getMyAppointmentFromDB = async (
  user: TAuthUser,
  filters: any,
  options: IPaginationOptions
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { ...filterData } = filters;

  const conditions: Prisma.AppointmentWhereInput[] = [];

  // filter if filter data specified
  if (Object.keys(filterData).length > 0) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  // filter based on user role
  if (user?.role === UserRole.PATIENT) {
    conditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    conditions.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  // execute query
  const result = await prisma.appointment.findMany({
    where: { AND: conditions } as Prisma.AppointmentWhereInput,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          },
  });

  // count total
  const total = await prisma.appointment.count({
    where: { AND: conditions } as Prisma.AppointmentWhereInput,
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

export const AppointmentServices = {
  createAppointmentIntoDB,
  getMyAppointmentFromDB,
};
