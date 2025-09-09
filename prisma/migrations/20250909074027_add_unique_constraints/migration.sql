/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `fee_groups` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "public"."classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "fee_groups_name_key" ON "public"."fee_groups"("name");
