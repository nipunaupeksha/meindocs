ALTER TABLE `document_series` ADD `related_person_id` text REFERENCES people(id);--> statement-breakpoint
ALTER TABLE `document_series` ADD `default_case_id` text REFERENCES cases(id);