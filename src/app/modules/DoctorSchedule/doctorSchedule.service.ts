import prisma from "../../../shared/prisma";

const createDoctorScheduleIntoDB = async (
  user: any,
  payload: { scheduleIds: string[] }
) => {
  const doctor = await prisma.doctor.findUnique({
    where: { email: user.email },
  });
  console.log(payload.scheduleIds);
};

export const DoctorScheduleServices = {
  createDoctorScheduleIntoDB,
};
