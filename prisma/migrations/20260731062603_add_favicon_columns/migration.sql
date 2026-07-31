-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "header_menus" JSONB,
ADD COLUMN     "use_favicon" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "use_global_header" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "use_logo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "favicon_url" TEXT;
