import { BloodGroup, Gender, MeritalStatus } from "@prisma/client";

export interface IPatientFilterRequest {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  gender?: string | undefined;
  searchTerm?: string | undefined;
}

export interface IPatientHealthData {
  gender: Gender;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  hasAllergies?: boolean;
  hasDiabetes?: boolean;
  height: string;
  weight: string;
  smokingStatus?: boolean;
  dietaryPreferences?: string;
  pregnancyStatus?: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries?: boolean;
  recentAnxiety?: boolean;
  recentDepression?: boolean;
  maritalStatus?: MeritalStatus;
}

export interface IMedicalReport {
  reportName: string;
  reportLink: string;
}

export interface IPatientUpdate {
  name: string;
  contactNumber: string;
  address: string;
  patientHealthData: IPatientHealthData;
  medicalReport: IMedicalReport;
}
