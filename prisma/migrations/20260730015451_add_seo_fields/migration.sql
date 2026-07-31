-- AlterTable
ALTER TABLE "products" ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_image" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "store_pages" ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_image" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "google_site_verification" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_image" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "thumbnail" TEXT,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "articles_store_id_idx" ON "articles"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_store_id_slug_key" ON "articles"("store_id", "slug");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
