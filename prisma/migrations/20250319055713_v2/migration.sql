/*
  Warnings:

  - Added the required column `proctorId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "proctorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "LibraryMembership" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryMembership_studentId_key" ON "LibraryMembership"("studentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_proctorId_fkey" FOREIGN KEY ("proctorId") REFERENCES "Professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryMembership" ADD CONSTRAINT "LibraryMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
