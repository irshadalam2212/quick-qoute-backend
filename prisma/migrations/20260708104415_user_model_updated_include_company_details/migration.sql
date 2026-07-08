-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `alternateMobile` VARCHAR(191) NULL,
    ADD COLUMN `companyName` VARCHAR(191) NULL,
    ADD COLUMN `gstNumber` VARCHAR(191) NULL,
    ADD COLUMN `logo` VARCHAR(191) NULL,
    ADD COLUMN `mobileNumber` VARCHAR(191) NULL,
    ADD COLUMN `panNumber` VARCHAR(191) NULL,
    ADD COLUMN `services` TEXT NULL,
    ADD COLUMN `signature` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;
