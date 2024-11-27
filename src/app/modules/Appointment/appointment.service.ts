import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuid4 } from "uuid";

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

    return appointmentData;
  });

  return result;
};

export const AppointmentServices = {
  createAppointmentIntoDB,
};
