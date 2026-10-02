CREATE TABLE `UserFeaturePermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `feature` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserFeaturePermission_userId_feature_key`(`userId`, `feature`),
    INDEX `UserFeaturePermission_feature_idx`(`feature`),
    PRIMARY KEY (`id`),
    CONSTRAINT `UserFeaturePermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Preserve the current feature access for existing non-admin accounts.
INSERT INTO `UserFeaturePermission` (`userId`, `feature`)
SELECT `User`.`id`, `features`.`feature`
FROM `User`
CROSS JOIN (
    SELECT 'DASHBOARD' AS `feature`
    UNION ALL SELECT 'QUOTATIONS'
    UNION ALL SELECT 'INVOICES'
    UNION ALL SELECT 'CATALOG'
    UNION ALL SELECT 'AI'
) AS `features`
WHERE `User`.`role` <> 'ADMIN';
