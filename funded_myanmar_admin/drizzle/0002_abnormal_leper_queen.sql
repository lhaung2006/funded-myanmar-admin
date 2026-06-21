CREATE TABLE `challengeRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traderId` int NOT NULL,
	`accountSize` int NOT NULL DEFAULT 0,
	`profitTarget` int NOT NULL DEFAULT 0,
	`dailyDrawdownLimit` int NOT NULL DEFAULT 0,
	`maxDrawdownLimit` int NOT NULL DEFAULT 0,
	`minTradingDays` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challengeRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tradeHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traderId` int NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`entryPrice` int NOT NULL,
	`exitPrice` int NOT NULL,
	`quantity` int NOT NULL,
	`profitLoss` int NOT NULL,
	`isWin` int NOT NULL DEFAULT 0,
	`tradeDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tradeHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `traders` MODIFY COLUMN `challengeStatus` enum('active','passed','failed','suspended') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `traders` ADD `traderStatus` enum('active','suspended','inactive') DEFAULT 'active' NOT NULL;