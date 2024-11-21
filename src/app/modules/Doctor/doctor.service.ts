import prisma from "../../../shared/prisma";

const getDoctorByIdFromDB = async (id: string) => {
  const result = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  return result;
};

export const doctorServices = {
  getDoctorByIdFromDB,
};
