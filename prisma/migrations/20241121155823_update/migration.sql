/*
  Warnings:

  - A unique constraint covering the columns `[patientId]` on the table `medical_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "medical_reports_patientId_key" ON "medical_reports"("patientId");
