ALTER TABLE `dustbins` ADD `wet_level` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dustbins` ADD `dry_level` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dustbins` ADD `wet_status` text DEFAULT 'empty' NOT NULL;--> statement-breakpoint
ALTER TABLE `dustbins` ADD `dry_status` text DEFAULT 'empty' NOT NULL;--> statement-breakpoint
CREATE INDEX `dustbins_wet_level_idx` ON `dustbins` (`wet_level`);--> statement-breakpoint
CREATE INDEX `dustbins_dry_level_idx` ON `dustbins` (`dry_level`);--> statement-breakpoint
CREATE INDEX `dustbins_wet_status_idx` ON `dustbins` (`wet_status`);--> statement-breakpoint
CREATE INDEX `dustbins_dry_status_idx` ON `dustbins` (`dry_status`);--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'ORG_ADMIN' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `plan` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profile` ADD `is_active` integer DEFAULT true NOT NULL;