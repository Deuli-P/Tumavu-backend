/*
  Warnings:

  - Added the required column `station_id` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "station_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "stations" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "country_id" INTEGER NOT NULL,
    "office_address_id" INTEGER NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stations" ADD CONSTRAINT "stations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stations" ADD CONSTRAINT "stations_office_address_id_fkey" FOREIGN KEY ("office_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
