CREATE TABLE "packages" (
	"id" text PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"namespace" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text DEFAULT '',
	"version" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"changelog" text DEFAULT '',
	"readme" text DEFAULT '',
	"downloads" integer DEFAULT 0,
	"verified" boolean DEFAULT false,
	"author_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" text PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"wasm_url" text NOT NULL,
	"manifest_url" text NOT NULL,
	"package_id" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT 'gen_random_uuid()' NOT NULL,
	"github_id" text NOT NULL,
	"username" text NOT NULL,
	"name" text,
	"avatar" text,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "packages_namespace_slug_idx" ON "packages" USING btree ("namespace","slug");