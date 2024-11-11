import { Request, Response } from "express";
import { adminServices } from "./admin.service";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.getAllAdminsFromDB();
    res.status(200).json({
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.name || "Error creating admin",
      error: error,
    });
  }
};

export const adminControllers = {
  createAdmin,
};
