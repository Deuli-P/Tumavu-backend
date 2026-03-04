/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `stations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `stations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stations" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "stations_name_key" ON "stations"("name");
