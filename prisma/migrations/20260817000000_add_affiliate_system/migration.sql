-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('pending_review', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable affiliate_codes
ALTER TABLE "affiliate_codes" 
  ADD COLUMN IF NOT EXISTS "user_id" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "owner_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "pending_balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paid_out" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "bank_name" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_account_number" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_account_name" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "AffiliateStatus" NOT NULL DEFAULT 'pending_review',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey for affiliate_codes -> users
ALTER TABLE "affiliate_codes" 
  ADD CONSTRAINT "affiliate_codes_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable affiliate_withdrawals
CREATE TABLE IF NOT EXISTS "affiliate_withdrawals" (
  "id" TEXT NOT NULL,
  "affiliate_id" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'pending',
  "notes" TEXT,
  "processed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "affiliate_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "affiliate_withdrawals_affiliate_id_idx" ON "affiliate_withdrawals"("affiliate_id");

-- AddForeignKey
ALTER TABLE "affiliate_withdrawals" 
  ADD CONSTRAINT "affiliate_withdrawals_affiliate_id_fkey" 
  FOREIGN KEY ("affiliate_id") REFERENCES "affiliate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
