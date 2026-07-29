-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "flat_shipping_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "midtrans_client_key" TEXT,
ADD COLUMN     "midtrans_is_production" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "midtrans_server_key" TEXT,
ADD COLUMN     "qris_image_url" TEXT;
