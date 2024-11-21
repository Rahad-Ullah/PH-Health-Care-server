import { Request } from "express";
import { fileUploader } from "../../../utils/fileUploader";
import prisma from "../../../shared/prisma";

// create a new speciality
const createSpecialityIntoDB = async (req: Request) => {
  // upload icon file to cloudinary
  const file = req.file;
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
