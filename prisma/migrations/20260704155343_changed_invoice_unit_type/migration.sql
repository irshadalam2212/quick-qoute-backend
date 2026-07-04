/*
  Warnings:

  - You are about to alter the column `unit` on the `invoiceitem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `invoiceitem` MODIFY `unit` DOUBLE NULL;
