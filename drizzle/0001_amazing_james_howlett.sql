CREATE TABLE `adminLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`traderId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`changes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`traderName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`accountNumber` varchar(64) NOT NULL,
	`challengeStatus` enum('active','passed','failed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traders_id` PRIMARY KEY(`id`),
	CONSTRAINT `traders_email_unique` UNIQUE(`email`),
	CONSTRAINT `traders_accountNumber_unique` UNIQUE(`accountNumber`)
);
--> statement-breakpoint
CREATE TABLE `tradingMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`traderId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`equity` int NOT NULL DEFAULT 0,
	`profitTarget` int NOT NULL DEFAULT 0,
	`dailyDrawdown` int NOT NULL DEFAULT 0,
	`dailyDrawdownLimit` int NOT NULL DEFAULT 0,
	`maxDrawdown` int NOT NULL DEFAULT 0,
	`maxDrawdownLimit` int NOT NULL DEFAULT 0,
	`tradingDaysUsed` int NOT NULL DEFAULT 0,
	`tradingDaysLimit` int NOT NULL DEFAULT 0,
	`winRate` int NOT NULL DEFAULT 0,
	`totalTrades` int NOT NULL DEFAULT 0,
	`challengeStartDate` timestamp NOT NULL DEFAULT (now()),
	`challengeEndDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tradingMetrics_id` PRIMARY KEY(`id`)
);
