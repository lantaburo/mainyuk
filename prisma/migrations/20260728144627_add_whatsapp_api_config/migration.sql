-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "whatsapp_api_key" TEXT,
ADD COLUMN     "whatsapp_api_key_header" TEXT NOT NULL DEFAULT 'Authorization',
ADD COLUMN     "whatsapp_api_key_prefix" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whatsapp_api_url" TEXT,
ADD COLUMN     "whatsapp_message_field" TEXT NOT NULL DEFAULT 'message',
ADD COLUMN     "whatsapp_target_field" TEXT NOT NULL DEFAULT 'target';
