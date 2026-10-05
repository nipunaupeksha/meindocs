CREATE TABLE `document_series` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`document_type` text NOT NULL,
	`issuer` text,
	`organisation_id` text,
	`expected_frequency` text NOT NULL,
	`default_tags` text DEFAULT '[]' NOT NULL,
	`default_tax_metadata` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `document_series_org_idx` ON `document_series` (`organisation_id`);--> statement-breakpoint
CREATE INDEX `document_series_type_frequency_idx` ON `document_series` (`document_type`,`expected_frequency`);--> statement-breakpoint
CREATE TABLE `document_series_members` (
	`id` text PRIMARY KEY NOT NULL,
	`series_id` text NOT NULL,
	`document_id` text NOT NULL,
	`document_date` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`series_id`) REFERENCES `document_series`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_series_members_pair_idx` ON `document_series_members` (`series_id`,`document_id`);--> statement-breakpoint
CREATE INDEX `document_series_members_document_idx` ON `document_series_members` (`document_id`);--> statement-breakpoint
CREATE INDEX `document_series_members_date_idx` ON `document_series_members` (`series_id`,`document_date`);