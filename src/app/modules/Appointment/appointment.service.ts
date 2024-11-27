import prisma from "../../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { v4 as uuid4 } from "uuid";

const createAppointmentIntoDB = async (
  user: TAuthUser,
  payload: { doctorId: string; scheduleId: string }
) => {
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

  const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuid4();

  const result = await prisma.appointment.create({
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

  return result;
};

export const AppointmentServices = {
  createAppointmentIntoDB,
};
