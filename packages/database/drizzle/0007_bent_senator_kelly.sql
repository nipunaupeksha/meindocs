CREATE INDEX `cases_status_idx` ON `cases` (`status`);--> statement-breakpoint
CREATE INDEX `cases_updated_at_idx` ON `cases` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `documents_updated_at_idx` ON `documents` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `documents_status_idx` ON `documents` (`status`);--> statement-breakpoint
CREATE INDEX `reminders_due_date_idx` ON `reminders` (`due_date`);--> statement-breakpoint
CREATE INDEX `reminders_expiry_date_idx` ON `reminders` (`expiry_date`);--> statement-breakpoint
CREATE INDEX `tax_metadata_year_idx` ON `tax_metadata` (`tax_year`);