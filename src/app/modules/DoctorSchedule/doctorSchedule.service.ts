import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";

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

export const DoctorScheduleServices = {
  createDoctorScheduleIntoDB,
};
