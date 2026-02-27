/*
  Warnings:

  - Made the column `ownerId` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstname` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastname` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_ownerId_fkey";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "firstname" SET NOT NULL,
ALTER COLUMN "lastname" SET NOT NULL;

-- CreateTable
CREATE TABLE "countries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "phone_indicatif" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
