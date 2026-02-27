/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "roles_label_key" ON "roles"("label");
