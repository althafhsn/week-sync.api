/*
  Warnings:

  - The primary key for the `priority_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `priority_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `project_statuses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `project_statuses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `report_highlight_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `report_highlight_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `report_hour_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `report_hour_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `report_statuses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `report_statuses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `review_action_types` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `review_action_types` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `task_statuses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `task_statuses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `project_status_id` on the `projects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `report_highlight_type_id` on the `report_highlights` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `report_hour_type_id` on the `report_hours` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `review_action_type_id` on the `report_review_actions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `report_status_id` on the `report_versions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priority_type_id` on the `tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `task_status_id` on the `tasks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role_id` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_project_status_id_fkey";

-- DropForeignKey
ALTER TABLE "report_highlights" DROP CONSTRAINT "report_highlights_report_highlight_type_id_fkey";

-- DropForeignKey
ALTER TABLE "report_hours" DROP CONSTRAINT "report_hours_report_hour_type_id_fkey";

-- DropForeignKey
ALTER TABLE "report_review_actions" DROP CONSTRAINT "report_review_actions_review_action_type_id_fkey";

-- DropForeignKey
ALTER TABLE "report_versions" DROP CONSTRAINT "report_versions_report_status_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_priority_type_id_fkey";

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_task_status_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- AlterTable
ALTER TABLE "priority_types" DROP CONSTRAINT "priority_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "priority_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "project_statuses" DROP CONSTRAINT "project_statuses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "project_statuses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "project_status_id",
ADD COLUMN     "project_status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "report_highlight_types" DROP CONSTRAINT "report_highlight_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "report_highlight_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "report_highlights" DROP COLUMN "report_highlight_type_id",
ADD COLUMN     "report_highlight_type_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "report_hour_types" DROP CONSTRAINT "report_hour_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "report_hour_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "report_hours" DROP COLUMN "report_hour_type_id",
ADD COLUMN     "report_hour_type_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "report_review_actions" DROP COLUMN "review_action_type_id",
ADD COLUMN     "review_action_type_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "report_statuses" DROP CONSTRAINT "report_statuses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "report_statuses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "report_versions" DROP COLUMN "report_status_id",
ADD COLUMN     "report_status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "review_action_types" DROP CONSTRAINT "review_action_types_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "review_action_types_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "task_statuses" DROP CONSTRAINT "task_statuses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "task_statuses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "priority_type_id",
ADD COLUMN     "priority_type_id" INTEGER NOT NULL,
DROP COLUMN "task_status_id",
ADD COLUMN     "task_status_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role_id",
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_status_id_fkey" FOREIGN KEY ("project_status_id") REFERENCES "project_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_report_status_id_fkey" FOREIGN KEY ("report_status_id") REFERENCES "report_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "priority_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_status_id_fkey" FOREIGN KEY ("task_status_id") REFERENCES "task_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_review_actions" ADD CONSTRAINT "report_review_actions_review_action_type_id_fkey" FOREIGN KEY ("review_action_type_id") REFERENCES "review_action_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_highlights" ADD CONSTRAINT "report_highlights_report_highlight_type_id_fkey" FOREIGN KEY ("report_highlight_type_id") REFERENCES "report_highlight_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_hours" ADD CONSTRAINT "report_hours_report_hour_type_id_fkey" FOREIGN KEY ("report_hour_type_id") REFERENCES "report_hour_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
