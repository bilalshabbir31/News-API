-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "confirmToken" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false;
