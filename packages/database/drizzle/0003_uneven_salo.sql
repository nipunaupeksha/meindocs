ALTER TABLE `documents` ADD `ocr_text` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `reference_number` text;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `tax_relevant` integer;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `expense_category` text;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `net_amount` real;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `vat_amount` real;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `gross_amount` real;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `vat_rate` real;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `business_use_percent` real;--> statement-breakpoint
ALTER TABLE `tax_metadata` ADD `review_status` text;--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  document_id UNINDEXED,
  title,
  ocr_text,
  summary,
  issuer,
  tags,
  reference_number
);--> statement-breakpoint
INSERT INTO documents_fts (document_id, title, ocr_text, summary, issuer, tags, reference_number)
SELECT d.id, d.title, COALESCE(d.ocr_text, ''), COALESCE(d.summary, ''),
  COALESCE(p.first_name || ' ' || p.last_name, o.name, ''),
  COALESCE((SELECT group_concat(t.name, ' ') FROM document_tags dt JOIN tags t ON t.id = dt.tag_id WHERE dt.document_id = d.id), ''),
  COALESCE(d.reference_number, '')
FROM documents d
LEFT JOIN people p ON p.id = d.issuer_person_id
LEFT JOIN organisations o ON o.id = d.issuer_organisation_id;
