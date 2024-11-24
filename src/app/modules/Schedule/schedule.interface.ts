export interface ISchedule {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

export interface IDoctorScheduleFilterRequest {
  startDateTime?: string | undefined;
  endDateTime?: string | undefined;
}