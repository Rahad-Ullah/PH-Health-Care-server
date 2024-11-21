import { sendResponse } from "../../../utils/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { SpecialitiesServices } from "./specialities.service";

const createSpeciality = catchAsync(async (req, res) => {
  const result = await SpecialitiesServices.createSpecialityIntoDB(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Speciality created successfully",
    data: result,
  });
});

export const SpecialitiesControllers = {
  createSpeciality,
};
