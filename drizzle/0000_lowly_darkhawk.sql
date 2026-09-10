CREATE TABLE `pin_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
