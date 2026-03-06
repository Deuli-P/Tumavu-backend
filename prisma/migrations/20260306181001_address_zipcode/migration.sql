/*
  Warnings:

  - You are about to drop the column `number` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `company_id` on the `annoucements` table. All the data in the column will be lost.
  - You are about to drop the column `job_id` on the `annoucements` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `annoucements` table. All the data in the column will be lost.
  - You are about to drop the column `job_id` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the column `contract_type` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `jobs` table. All the data in the column will be lost.
  - You are about to drop the column `job_id` on the `user_jobs` table. All the data in the column will be lost.
  - You are about to drop the `application_annoucments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[company_id,slug]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `streetNumber` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offer_id` to the `invitations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offer_id` to the `user_jobs` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERIENCED');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'SPRING', 'AUTUMN', 'ALL_YEAR');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('DAY', 'NIGHT', 'WEEKEND', 'VARIABLE');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('HOURLY', 'DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('NONE', 'PROVIDED', 'PROVIDED_AND_PAID');

-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContractOfferType" AS ENUM ('CDD', 'EXTRA', 'INTERIM', 'CDI');

-- CreateEnum
CREATE TYPE "ApplicationJobStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEW', 'TEST', 'PHONE');

-- DropForeignKey
ALTER TABLE "annoucements" DROP CONSTRAINT "annoucements_company_id_fkey";

-- DropForeignKey
ALTER TABLE "annoucements" DROP CONSTRAINT "annoucements_job_id_fkey";

-- DropForeignKey
ALTER TABLE "application_annoucments" DROP CONSTRAINT "application_annoucments_announcement_id_fkey";

-- DropForeignKey
ALTER TABLE "application_annoucments" DROP CONSTRAINT "application_annoucments_processed_by_fkey";

-- DropForeignKey
ALTER TABLE "application_annoucments" DROP CONSTRAINT "application_annoucments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_job_id_fkey";

-- DropForeignKey
ALTER TABLE "user_jobs" DROP CONSTRAINT "user_jobs_job_id_fkey";

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "number",
ADD COLUMN     "streetNumber" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "annoucements" DROP COLUMN "company_id",
DROP COLUMN "job_id",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "job_id",
ADD COLUMN     "offer_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "contract_type",
DROP COLUMN "status",
ADD COLUMN     "category_id" INTEGER,
ADD COLUMN     "experience_level" "ExperienceLevel",
ADD COLUMN     "licences" TEXT[],
ADD COLUMN     "physical_requirements" TEXT,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "season" "Season",
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "transport_required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_jobs" DROP COLUMN "job_id",
ADD COLUMN     "offer_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "application_annoucments";

-- DropEnum
DROP TYPE "AnnouncementStatus";

-- DropEnum
DROP TYPE "ApplicationAnnouncementStatus";

-- DropEnum
DROP TYPE "ContractType";

-- CreateTable
CREATE TABLE "job_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offers" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "company_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "duration" INTEGER,
    "flexible_dates" BOOLEAN NOT NULL DEFAULT false,
    "hours_per_week" DOUBLE PRECISION,
    "schedule" "ScheduleType",
    "address_id" INTEGER,
    "salary_type" "SalaryType",
    "salary_min" DOUBLE PRECISION,
    "salary_max" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "housing_provided" "HousingType" NOT NULL DEFAULT 'NONE',
    "housing_cost" DOUBLE PRECISION,
    "housing_description" TEXT,
    "meals_provided" BOOLEAN NOT NULL DEFAULT false,
    "transport_help" BOOLEAN NOT NULL DEFAULT false,
    "tips" BOOLEAN NOT NULL DEFAULT false,
    "bonus" BOOLEAN NOT NULL DEFAULT false,
    "contract_type" "ContractOfferType",
    "application_deadline" TIMESTAMP(3),
    "status" "JobOfferStatus" NOT NULL DEFAULT 'DRAFT',
    "near_train_station" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_jobs" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ApplicationJobStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "resume_url" TEXT,
    "processed_by" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "application_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_name_key" ON "job_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "job_categories_slug_key" ON "job_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_company_id_slug_key" ON "jobs"("company_id", "slug");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "job_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_jobs" ADD CONSTRAINT "application_jobs_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_jobs" ADD CONSTRAINT "application_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_jobs" ADD CONSTRAINT "application_jobs_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_jobs" ADD CONSTRAINT "user_jobs_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "job_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
