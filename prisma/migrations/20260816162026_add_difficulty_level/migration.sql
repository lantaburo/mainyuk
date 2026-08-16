/*
  Warnings:

  - You are about to drop the column `user_id` on the `student_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,module_id]` on the table `student_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `student_id` to the `student_progress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DropForeignKey
ALTER TABLE "student_progress" DROP CONSTRAINT IF EXISTS "student_progress_user_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "student_progress_user_id_idx";

-- DropIndex
DROP INDEX IF EXISTS "student_progress_user_id_module_id_key";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "difficulty_level" INTEGER NOT NULL DEFAULT 1;

-- Truncate student_progress because we are adding a NOT NULL column (student_id) without a default value
TRUNCATE TABLE "student_progress" CASCADE;

-- AlterTable
ALTER TABLE "student_progress" DROP COLUMN IF EXISTS "user_id",
ADD COLUMN IF NOT EXISTS "current_level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "student_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "student_profiles" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade_level" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "discount_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL DEFAULT 'percentage',
    "discount_pct" DECIMAL(5,2),
    "discount_amt" DECIMAL(12,2),
    "min_order" DECIMAL(12,2),
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "affiliate_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "owner_email" TEXT,
    "commission_pct" DECIMAL(5,2) NOT NULL,
    "total_conversions" INTEGER NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_profiles_parent_id_idx" ON "student_profiles"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "discount_codes_code_key" ON "discount_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "affiliate_codes_code_key" ON "affiliate_codes"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "student_progress_student_id_idx" ON "student_progress"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "student_progress_student_id_module_id_key" ON "student_progress"("student_id", "module_id");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
