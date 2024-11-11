import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await adminServices.getAllAdminsFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.name || "Error creating admin",
      error: error,
    });
  }
};

export const adminControllers = {
  getAllAdmins,
};
