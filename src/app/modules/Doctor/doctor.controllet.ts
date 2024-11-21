import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { sendResponse } from "../../../utils/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";
import { doctorServices } from "./doctor.service";

const getAllDoctors = catchAsync(async (req, res) => {
  const filters = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await doctorServices.getAllDoctorsFromDB(filters, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors retrieved successfully",
    data: result,
  });
});

const getDoctorById = catchAsync(async (req, res) => {
  const result = await doctorServices.getDoctorByIdFromDB(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req, res) => {
  const result = await doctorServices.updateDoctorIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

export const doctorControllers = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
};
