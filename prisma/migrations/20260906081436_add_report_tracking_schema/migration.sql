/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportHighlightCategory" AS ENUM ('ACHIEVEMENT', 'BLOCKER');


-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "project_status_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_statuses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "project_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_projects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,

    CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_statuses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "report_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_versions" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "report_status_id" UUID NOT NULL,
    "notes" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "links" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "report_version_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "priority_type_id" UUID NOT NULL,
    "task_status_id" UUID NOT NULL,
    "planned" INTEGER,
    "actual" INTEGER,
    "planned_hour" INTEGER,
    "actual_hour" INTEGER,
    "deliverable" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "priority_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "priority_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_statuses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "task_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_action_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "review_action_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_review_actions" (
    "id" UUID NOT NULL,
    "report_version_id" UUID NOT NULL,
    "review_action_type_id" UUID NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_review_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_highlight_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "category" "ReportHighlightCategory" NOT NULL,

    CONSTRAINT "report_highlight_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_highlights" (
    "id" UUID NOT NULL,
    "report_version_id" UUID NOT NULL,
    "report_highlight_type_id" UUID NOT NULL,
    "is_key" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "report_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_hours" (
    "id" UUID NOT NULL,
    "report_version_id" UUID NOT NULL,
    "report_hour_type_id" UUID NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "report_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_hour_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "report_hour_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "project_statuses_name_key" ON "project_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_projects_user_id_project_id_key" ON "user_projects"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_statuses_name_key" ON "report_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "priority_types_name_key" ON "priority_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "task_statuses_name_key" ON "task_statuses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "review_action_types_name_key" ON "review_action_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "report_review_actions_report_version_id_key" ON "report_review_actions"("report_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_highlight_types_name_key" ON "report_highlight_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "report_hour_types_name_key" ON "report_hour_types"("name");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_status_id_fkey" FOREIGN KEY ("project_status_id") REFERENCES "project_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_versions" ADD CONSTRAINT "report_versions_report_status_id_fkey" FOREIGN KEY ("report_status_id") REFERENCES "report_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_report_version_id_fkey" FOREIGN KEY ("report_version_id") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priority_type_id_fkey" FOREIGN KEY ("priority_type_id") REFERENCES "priority_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_status_id_fkey" FOREIGN KEY ("task_status_id") REFERENCES "task_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_review_actions" ADD CONSTRAINT "report_review_actions_report_version_id_fkey" FOREIGN KEY ("report_version_id") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_review_actions" ADD CONSTRAINT "report_review_actions_review_action_type_id_fkey" FOREIGN KEY ("review_action_type_id") REFERENCES "review_action_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_highlights" ADD CONSTRAINT "report_highlights_report_version_id_fkey" FOREIGN KEY ("report_version_id") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_highlights" ADD CONSTRAINT "report_highlights_report_highlight_type_id_fkey" FOREIGN KEY ("report_highlight_type_id") REFERENCES "report_highlight_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_hours" ADD CONSTRAINT "report_hours_report_version_id_fkey" FOREIGN KEY ("report_version_id") REFERENCES "report_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_hours" ADD CONSTRAINT "report_hours_report_hour_type_id_fkey" FOREIGN KEY ("report_hour_type_id") REFERENCES "report_hour_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
