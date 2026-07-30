-- AlterTable
ALTER TABLE "users" ADD COLUMN     "yandex_id" TEXT,
ADD COLUMN     "vk_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_yandex_id_key" ON "users"("yandex_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_vk_id_key" ON "users"("vk_id");
