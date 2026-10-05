CREATE TABLE `saved_searches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT 'search' NOT NULL,
	`filters` text DEFAULT '{}' NOT NULL,
	`sort` text DEFAULT 'newest' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `saved_searches_updated_idx` ON `saved_searches` (`updatedAt`);