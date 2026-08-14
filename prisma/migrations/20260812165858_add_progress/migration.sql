-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "class_level" INTEGER;

-- CreateTable
CREATE TABLE "student_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_progress_user_id_idx" ON "student_progress"("user_id");

-- CreateIndex
CREATE INDEX "student_progress_module_id_idx" ON "student_progress"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_progress_user_id_module_id_key" ON "student_progress"("user_id", "module_id");

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progress" ADD CONSTRAINT "student_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
