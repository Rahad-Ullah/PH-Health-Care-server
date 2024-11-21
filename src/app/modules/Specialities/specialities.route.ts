import express, { NextFunction, Request, Response } from "express";
import { SpecialitiesControllers } from "./specialities.controller";
import { fileUploader } from "../../../utils/fileUploader";
import { SpecialitiesValidations } from "./specialities.validation";

const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialitiesValidations.createSpeciality.parse(
      JSON.parse(req.body.data)
    );
    return SpecialitiesControllers.createSpeciality(req, res, next);
  }
);

export const SpecialitiesRoutes = router;
