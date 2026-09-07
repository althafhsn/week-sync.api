/*
  Warnings:

  - You are about to drop the column `report_version_id` on the `report_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `report_version_id` on the `report_hours` table. All the data in the column will be lost.
  - You are about to drop the column `report_version_id` on the `report_next_week_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `current_version` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `report_version_id` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `report_versions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `report_id` to the `report_highlights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_id` to the `report_hours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_id` to the `report_next_week_tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_status_id` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `report_id` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "report_highlights" DROP CONSTRAINT "report_highlights_report_version_id_fkey";

-- DropForeignKey
ALTER TABLE "report_hours" DROP CONSTRAINT "report_hours_report_version_id_fkey";

-- DropForeignKey
ALTER TABLE "report_next_week_tasks" DROP CONSTRAINT "report_next_week_tasks_report_version_id_fkey";

-- DropForeignKey
ALTER TABLE "report_versions" DROP CONSTRAINT "report_versions_report_id_fkey";

-- DropForeignKey
ALTER TABLE "report_versions" DROP CONSTRAINT "report_versions_report_status_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_report_version_id_fkey";

-- AlterTable
ALTER TABLE "report_highlights" DROP COLUMN "report_version_id",
ADD COLUMN     "report_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "report_hours" DROP COLUMN "report_version_id",
ADD COLUMN     "report_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "report_next_week_tasks" DROP COLUMN "report_version_id",
ADD COLUMN     "report_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "current_version",
ADD COLUMN     "comment" TEXT,
ADD COLUMN     "end_date" DATE NOT NULL,
ADD COLUMN     "links" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "report_status_id" INTEGER NOT NULL,
ADD COLUMN     "start_date" DATE NOT NULL;

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "report_version_id",
ADD COLUMN     "report_id" UUID NOT NULL;

-- DropTable
DROP TABLE "report_versions";

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_report_status_id_fkey" FOREIGN KEY ("report_status_id") REFERENCES "report_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_highlights" ADD CONSTRAINT "report_highlights_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_next_week_tasks" ADD CONSTRAINT "report_next_week_tasks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_hours" ADD CONSTRAINT "report_hours_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
