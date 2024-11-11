import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";

const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any, options: any) => {
  const { page, limit } = options;
  const { searchTerm, ...filterData } = params;
  const conditions: Prisma.AdminWhereInput[] = [];

  if (params.searchTerm) {
    conditions.push({
      OR: adminSearchableFields.map((value) => ({
        [value]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    conditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: filterData[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AdminWhereInput = { AND: conditions };

  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
  });
  return result;
};

export const adminServices = {
  getAllAdminsFromDB,
};
