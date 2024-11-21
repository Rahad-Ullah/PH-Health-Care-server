import { Request } from "express";
import { fileUploader } from "../../../utils/fileUploader";
import prisma from "../../../shared/prisma";
import { IUploadedFile } from "../../interfaces/file";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

// create a new speciality
const createSpecialityIntoDB = async (req: Request) => {
  // check if the speciality already exists
  const speciality = await prisma.specialities.findFirst({
    where: { title: req.body.title },
  });
  if (speciality) {
    throw new ApiError(StatusCodes.CONFLICT, "The speciality already exists");
  }

  // upload icon file to cloudinary
  const file = req.file as IUploadedFile;
  if (file) {
    const uploadedToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadedToCloudinary?.secure_url;
  }

  // create speciality into DB
  const result = await prisma.specialities.create({
    data: req.body,
  });

  return result;
};



export const SpecialitiesServices = {
  createSpecialityIntoDB,
};
