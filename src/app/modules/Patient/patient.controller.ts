import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { sendResponse } from "../../../utils/sendResponse";
import { patientFilterableFields } from "./patient.constant";
import { patientServices } from "./patient.service";

const getAllPatients = catchAsync(async (req, res) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await patientServices.getAllPatientsFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patients retrieved successfully",
    data: result,
  });
});

const getSinglePatient = catchAsync(async (req, res) => {
  const result = await patientServices.getSinglePatientFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient retrieved successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const result = await patientServices.updatePatientIntoDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});


const deletePatient = catchAsync(async (req, res) => {
  const result = await patientServices.deletePatientFromBD(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});


const softDeletePatient = catchAsync(async (req, res) => {
  const result = await patientServices.softDeletePatientFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const patientControllers = {
  getAllPatients,
  getSinglePatient,
  updatePatient,
  deletePatient,
  softDeletePatient,
};
