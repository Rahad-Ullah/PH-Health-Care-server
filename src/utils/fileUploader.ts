import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { IUploadedFile } from "../app/interfaces/file";
import config from "../config";

// Configuration
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret, // Click 'View API Keys' above to copy your API secret
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Upload an image by cloudinary
const uploadToCloudinary = async (file: IUploadedFile) => {
  try {
    const res = await cloudinary.uploader.upload(file.path, {
      public_id: file.originalname,
    });
    // remove file from storage after upload success
    fs.unlinkSync(file.path);
    return res;
  } catch (error) {
    // remove file from storage if upload error
    fs.unlinkSync(file.path);
    console.log(error);
  }
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
