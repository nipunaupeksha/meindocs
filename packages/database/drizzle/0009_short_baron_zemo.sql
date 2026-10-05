CREATE TABLE `custom_field_definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`options` text,
	`required` integer DEFAULT false NOT NULL,
	`scope_kind` text DEFAULT 'global' NOT NULL,
	`scope_domain` text,
	`scope_document_type` text,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_field_definitions_key_scope_idx` ON `custom_field_definitions` (`key`,`scope_kind`,`scope_domain`,`scope_document_type`);--> statement-breakpoint
CREATE INDEX `custom_field_definitions_scope_idx` ON `custom_field_definitions` (`scope_kind`,`scope_domain`,`scope_document_type`);--> statement-breakpoint
CREATE TABLE `custom_field_values` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`definition_id` text NOT NULL,
	`value` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`definition_id`) REFERENCES `custom_field_definitions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_field_values_document_definition_idx` ON `custom_field_values` (`document_id`,`definition_id`);--> statement-breakpoint
CREATE INDEX `custom_field_values_definition_idx` ON `custom_field_values` (`definition_id`);