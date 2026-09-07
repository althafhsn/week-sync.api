/*
  Warnings:

  - You are about to drop the `report_review_actions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review_action_types` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "report_review_actions" DROP CONSTRAINT "report_review_actions_report_version_id_fkey";

-- DropForeignKey
ALTER TABLE "report_review_actions" DROP CONSTRAINT "report_review_actions_review_action_type_id_fkey";

-- AlterTable
ALTER TABLE "report_versions" ADD COLUMN     "comment" TEXT;

-- DropTable
DROP TABLE "report_review_actions";

-- DropTable
DROP TABLE "review_action_types";
