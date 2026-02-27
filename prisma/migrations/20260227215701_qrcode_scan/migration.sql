-- CreateTable
CREATE TABLE "user_passages" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "last_passage_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "job_id" INTEGER,

    CONSTRAINT "user_passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_default_options" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "max_passages_per_day" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "company_default_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_benefits" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "company_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "min_passages" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "company_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_passages_user_id_company_id_date_key" ON "user_passages"("user_id", "company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "company_default_options_company_id_key" ON "company_default_options"("company_id");

-- AddForeignKey
ALTER TABLE "user_passages" ADD CONSTRAINT "user_passages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passages" ADD CONSTRAINT "user_passages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passages" ADD CONSTRAINT "user_passages_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_default_options" ADD CONSTRAINT "company_default_options_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_benefits" ADD CONSTRAINT "company_benefits_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
