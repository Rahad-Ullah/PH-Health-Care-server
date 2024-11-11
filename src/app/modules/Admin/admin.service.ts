import { Prisma } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import { calculatePagination } from "../../../utils/pagination";
import prisma from "../../../shared/prisma";

const getAllAdminsFromDB = async (params: any, options: any) => {
  const { limit, skip, sortBy, sortOrder } = calculatePagination(options);
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
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  return result;
};

export const adminServices = {
  getAllAdminsFromDB,
};
