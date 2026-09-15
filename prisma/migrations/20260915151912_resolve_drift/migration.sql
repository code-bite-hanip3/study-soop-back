-- AlterTable
ALTER TABLE "FocusSession" DROP COLUMN "durationSeconds";

-- AlterTable
ALTER TABLE "PointHistory" DROP COLUMN "type";

-- CreateIndex
CREATE UNIQUE INDEX "PointHistory_studyId_key" ON "PointHistory"("studyId");

-- CreateIndex
CREATE UNIQUE INDEX "PointHistory_focusSessionId_key" ON "PointHistory"("focusSessionId");

