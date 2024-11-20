import { Gender, UserStatus } from "@prisma/client";
import { z } from "zod";

// validation schema for create admin
const createAdminValidationSchema = z.object({
  password: z.string({ required_error: "Password is required" }),
  admin: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    contactNumber: z.string({ required_error: "Contact Number is required" }),
  }),
});

// validation schema for create doctor
const createDoctorValidationSchema = z.object({
  password: z.string({ required_error: "Password is required" }),
  doctor: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    contactNumber: z.string({ required_error: "Contact Number is required" }),
    address: z.string().optional(),
    registrationNumber: z.string({
      required_error: "Registration Number is required",
    }),
    experience: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    appointmentFee: z.number({ required_error: "Appointment Fee is required" }),
    qualification: z.string({ required_error: "Qualification is required" }),
    currentWorkingPlace: z.string({
      required_error: "Current Working Place is required",
    }),
    designation: z.string({ required_error: "Designation is required" }),
  }),
});

// validation schema for create patient
const createPatientValidationSchema = z.object({
  password: z.string({ required_error: "Password is required" }),
  patient: z.object({
    name: z.string({ required_error: "Name is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" }),
    contactNumber: z.string({ required_error: "Contact Number is required" }),
    address: z.string().optional(),
  }),
});

const updateUserStatus = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED]),
  }),
});

export const userValidation = {
  createAdminValidationSchema,
  createDoctorValidationSchema,
  createPatientValidationSchema,
  updateUserStatus,
};
