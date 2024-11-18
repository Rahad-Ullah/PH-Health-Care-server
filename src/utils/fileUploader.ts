import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: "dh3obuo8s",
  api_key: "394986673515495",
  api_secret: "jwQ5UJBZW3zudHTi63SR76MFVJQ", // Click 'View API Keys' above to copy your API secret
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

const uploadToCloudinary = async (file: any) => {
  // Upload an image
  await cloudinary.uploader
    .upload(
      `K:/Web Level - 2/Milestone - 08/PH-Health-Care-Server/uploads/my-post.png`,
      {
        public_id: "shoes",
      }
    )
    .catch((error) => {
      console.log(error);
    });
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
