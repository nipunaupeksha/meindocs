CREATE TABLE `actions` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`type` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`actor_person_id` text,
	`actor_organisation_id` text,
	`note` text,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `case_documents` (
	`case_id` text NOT NULL,
	`document_id` text NOT NULL,
	PRIMARY KEY(`case_id`, `document_id`),
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	`owner_person_id` text,
	`organisation_id` text,
	FOREIGN KEY (`owner_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `document_relations` (
	`id` text PRIMARY KEY NOT NULL,
	`source_document_id` text NOT NULL,
	`target_document_id` text NOT NULL,
	`relation_type` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`source_document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_relations_pair_idx` ON `document_relations` (`source_document_id`,`target_document_id`,`relation_type`);--> statement-breakpoint
CREATE TABLE `document_tags` (
	`document_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`document_id`, `tag_id`),
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`type` text NOT NULL,
	`domain` text NOT NULL,
	`status` text DEFAULT 'inbox' NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	`file_name` text,
	`mime_type` text,
	`file_size_bytes` integer,
	`storage_uri` text,
	`issuer_person_id` text,
	`issuer_organisation_id` text,
	`recipient_person_id` text,
	`recipient_organisation_id` text,
	`can_edit` integer DEFAULT true NOT NULL,
	`can_delete` integer DEFAULT true NOT NULL,
	`can_share` integer DEFAULT true NOT NULL,
	`can_download` integer DEFAULT true NOT NULL,
	`can_archive` integer DEFAULT true NOT NULL,
	`can_create_reminder` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`issuer_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`issuer_organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_person_id`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_organisation_id`) REFERENCES `organisations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `documents_storage_uri_idx` ON `documents` (`storage_uri`);--> statement-breakpoint
CREATE TABLE `organisations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`registration_number` text,
	`tax_number` text,
	`email` text,
	`phone` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` real NOT NULL,
	`currency` text NOT NULL,
	`due_date` text,
	`paid_at` text,
	`reference` text,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`phone` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text,
	`title` text NOT NULL,
	`due_date` text NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`notes` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `tax_metadata` (
	`document_id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`tax_year` integer,
	`deductible` integer,
	`deductible_amount` real,
	`notes` text,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
