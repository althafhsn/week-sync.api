/*
  Warnings:

  - Added the required column `versionNumber` to the `report_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "report_versions" ADD COLUMN     "versionNumber" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "report_next_week_tasks" (
    "id" UUID NOT NULL,
    "report_version_id" UUID NOT NULL,
    "description" TEXT,

    CONSTRAINT "report_next_week_tasks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "report_next_week_tasks" ADD CONSTRAINT "report_next_week_tasks_report_version_id_fkey" FOREIGN KEY ("report_version_id") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
