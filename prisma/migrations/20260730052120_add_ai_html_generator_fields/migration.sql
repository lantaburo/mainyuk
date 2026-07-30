-- AlterTable
ALTER TABLE "store_pages" ADD COLUMN "html" TEXT NOT NULL DEFAULT '';
ALTER TABLE "store_pages" ADD COLUMN "brief_json" JSONB;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN "target_audience" TEXT;
