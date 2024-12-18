import { Patient, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { calculatePagination } from "../../../utils/pagination";
import { patientSearchableFields } from "./patient.constant";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAllPatientsFromDB = async (
  params: IPatientFilterRequest,
  options: IPaginationOptions
) => {
  // format params and options information
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const whereConditions: Prisma.PatientWhereInput[] = [];

  // filter if search term specified
  if (searchTerm) {
    whereConditions.push({
      OR: patientSearchableFields.map((field) => ({
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
  const result = await prisma.patient.findMany({
    where: { AND: whereConditions } as Prisma.PatientWhereInput,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  // count total
  const total = await prisma.patient.count({
    where: { AND: whereConditions } as Prisma.PatientWhereInput,
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

const getSinglePatientFromDB = async (id: string) => {
  const result = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  return result;
};

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<IPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  // check if the patient is exists
  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (txClient) => {
    // update the patient data
    await txClient.patient.update({
      where: {
        id,
      },
      data: patientData,
    });

    // create or update health data
    if (patientHealthData) {
      await txClient.patientHealthData.upsert({
        where: {
          patientId: patient.id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: patient.id },
      });
    }

    // create medical report data
    if (medicalReport) {
      await txClient.medicalReport.create({
        data: { ...medicalReport, patientId: patient.id },
      });
    }
  });

  // updated patient data with health data and medical report
  const responseData = await prisma.patient.findUnique({
    where: { id },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });

  return responseData;
};

const deletePatientFromBD = async (id: string): Promise<Patient | null> => {
  // check if patient is exist
  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    // delete from patient health data table
    await tx.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    // delete from medical report table
    await tx.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    // delete from patient table
    await tx.patient.delete({
      where: {
        id,
      },
    });

    // delete from user table
    await tx.user.delete({
      where: {
        email: patient.email,
      },
    });

    return patient;
  });

  return result;
};

const softDeletePatientFromDB = async (id: string): Promise<Patient | null> => {
  // check if patient is exists
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (tx) => {
    // update patient
    const deletedPatient = await tx.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    // update status of user model
    await tx.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });

  return result;
};

export const patientServices = {
  getAllPatientsFromDB,
  getSinglePatientFromDB,
  updatePatientIntoDB,
  deletePatientFromBD,
  softDeletePatientFromDB,
};
