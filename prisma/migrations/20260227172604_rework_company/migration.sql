-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "city" TEXT,
ADD COLUMN     "language_code" TEXT DEFAULT 'FR',
ADD COLUMN     "notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "phone" TEXT;
