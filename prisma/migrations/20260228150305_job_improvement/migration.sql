-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CDI', 'CDD', 'INTERIM', 'FREELANCE', 'STAGE', 'ALTERNANCE', 'SAISONNIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "MinimumEducationLevel" AS ENUM ('AUCUNE', 'CAP_BEP', 'BACCALAUREAT', 'BAC_PLUS_2', 'LICENCE', 'MASTER', 'DOCTORAT');

-- CreateEnum
CREATE TYPE "HousingSupport" AS ENUM ('NONE', 'PROVIDED', 'PROVIDED_AND_PAID');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "contract_type" "ContractType",
ADD COLUMN     "housing_support" "HousingSupport" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "minimum_education" "MinimumEducationLevel",
ADD COLUMN     "required_experience" TEXT,
ADD COLUMN     "required_languages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "job_skill_requirements" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "skill" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "job_skill_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_skill_requirements_job_id_idx" ON "job_skill_requirements"("job_id");

-- AddForeignKey
ALTER TABLE "job_skill_requirements" ADD CONSTRAINT "job_skill_requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
