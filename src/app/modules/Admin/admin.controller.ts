import { NextFunction, Request, RequestHandler, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { sendResponse } from "../../../utils/sendResponse";

const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const getAllAdmins = catchAsync(async (req, res) => {
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
});

const getAdminById = catchAsync(async (req, res) => {
  const result = await adminServices.getAdminByIdFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const result = await adminServices.updateAdminIntoDB(req.params.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const result = await adminServices.deleteAdminFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const softDeleteAdmin = catchAsync(async (req, res) => {
  const result = await adminServices.softDeleteAdminFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
