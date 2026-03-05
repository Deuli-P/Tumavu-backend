/*
  Warnings:

  - You are about to drop the column `createdAt` on the `passages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,company_id,created_at]` on the table `passages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "passages_user_id_company_id_createdAt_key";

-- AlterTable
ALTER TABLE "passages" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "passages_user_id_company_id_created_at_key" ON "passages"("user_id", "company_id", "created_at");
