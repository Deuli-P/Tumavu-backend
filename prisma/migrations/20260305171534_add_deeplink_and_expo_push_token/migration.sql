-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PASSAGE_REQUEST';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "deep_link" TEXT;

-- CreateTable
CREATE TABLE "expo_push_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "expo_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expo_push_tokens_token_key" ON "expo_push_tokens"("token");

-- AddForeignKey
ALTER TABLE "expo_push_tokens" ADD CONSTRAINT "expo_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
