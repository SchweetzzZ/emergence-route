-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED';
