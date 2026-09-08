-- CreateTable
CREATE TABLE "report_history" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "report_status_id" INTEGER NOT NULL,
    "comment" TEXT,
    "notes" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "links" TEXT,
    "snapshot" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_history_report_id_version_number_key" ON "report_history"("report_id", "version_number");

-- AddForeignKey
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_history" ADD CONSTRAINT "report_history_report_status_id_fkey" FOREIGN KEY ("report_status_id") REFERENCES "report_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
