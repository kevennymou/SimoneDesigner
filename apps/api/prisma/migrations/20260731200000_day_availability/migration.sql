-- DropTable
DROP TABLE "WeeklyAvailability";

-- DropTable
DROP TABLE "BlockedDate";

-- CreateTable
CREATE TABLE "DayAvailability" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "times" TEXT[],

    CONSTRAINT "DayAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DayAvailability_date_key" ON "DayAvailability"("date");
