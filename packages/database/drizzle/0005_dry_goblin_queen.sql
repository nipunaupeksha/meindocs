ALTER TABLE `cases` ADD `description` text;--> statement-breakpoint
ALTER TABLE `cases` ADD `deadline` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `generated_from_template` text;--> statement-breakpoint
ALTER TABLE `reminders` DROP COLUMN `description`;--> statement-breakpoint
ALTER TABLE `reminders` DROP COLUMN `deadline`;