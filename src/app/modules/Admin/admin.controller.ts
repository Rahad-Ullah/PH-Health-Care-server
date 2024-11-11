import { NextFunction, Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { sendResponse } from "../../../utils/sendResponse";

const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await adminServices.getAllAdminsFromDB(filters, options);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error: any) {
    next(error)
  }
};

const getAdminById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminServices.getAdminByIdFromDB(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
};

const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminServices.updateAdminIntoDB(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminServices.deleteAdminFromDB(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
};

const softDeleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminServices.softDeleteAdminFromDB(req.params.id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error)
  }
};

export const adminControllers = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
