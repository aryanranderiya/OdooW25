/*
  Warnings:

  - You are about to drop the `ApprovalRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_approverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ApprovalRequest" DROP CONSTRAINT "ApprovalRequest_expenseId_fkey";

-- DropTable
DROP TABLE "public"."ApprovalRequest";

-- CreateTable
CREATE TABLE "ApprovalAction" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApprovalAction_expenseId_idx" ON "ApprovalAction"("expenseId");

-- CreateIndex
CREATE INDEX "ApprovalAction_approverId_idx" ON "ApprovalAction"("approverId");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalAction_expenseId_approverId_key" ON "ApprovalAction"("expenseId", "approverId");

-- AddForeignKey
ALTER TABLE "ApprovalAction" ADD CONSTRAINT "ApprovalAction_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalAction" ADD CONSTRAINT "ApprovalAction_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
