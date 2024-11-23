import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";

const createScheduleIntoDB = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const slotInterval = 30;

  const schedules = []; //  all schedules is stored here and we return a list of schedules

  const currentDate = new Date(startDate); // start date
  const lastDate = new Date(endDate); // end date

  // loop for date range
  while (currentDate <= lastDate) {
    // add hour with date
    const startDateTime = new Date(
      addHours(
        format(currentDate, "yyyy-MM-dd"),
        Number(startTime.split(":")[0])
      )
    );
    // add hour with date
    const endDateTime = new Date(
      addHours(format(currentDate, "yyyy-MM-dd"), Number(endTime.split(":")[0]))
    );

    // loop for time range
    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, slotInterval),
      };

      // create schedule in DB
      const result = await prisma.schedule.create({
        data: scheduleData,
      });

      // push to schedules array
      schedules.push(result);

      // increase start time by interval
      startDateTime.setMinutes(startDateTime.getMinutes() + slotInterval);
    }

    // increase current date by 1
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // return schedule list
  return schedules;
};

export const scheduleServices = {
  createScheduleIntoDB,
};
