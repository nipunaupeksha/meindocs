ALTER TABLE `organisations` ADD `type` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `organisations` ADD `address` text;--> statement-breakpoint
ALTER TABLE `organisations` ADD `website` text;--> statement-breakpoint
ALTER TABLE `organisations` ADD `customer_reference` text;--> statement-breakpoint
ALTER TABLE `people` ADD `preferred_name` text;--> statement-breakpoint
ALTER TABLE `people` ADD `date_of_birth` text;--> statement-breakpoint
ALTER TABLE `people` ADD `relationship` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `people` ADD `addresses` text;--> statement-breakpoint
ALTER TABLE `people` ADD `nationality` text;--> statement-breakpoint
ALTER TABLE `people` ADD `identifiers_encrypted` text;