-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."OtpPurpose" AS ENUM ('REGISTER', 'LOGIN');

-- CreateEnum
CREATE TYPE "public"."PaymentProvider" AS ENUM ('YOOKASSA');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'WAITING_FOR_CAPTURE', 'SUCCEEDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'ORGANIZER', 'DOCTOR');

-- CreateTable
CREATE TABLE "public"."lecturers" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "position" TEXT NOT NULL,
    "years_experience" INTEGER NOT NULL,
    "achievements" JSONB NOT NULL DEFAULT '[]',
    "photo_url" TEXT,
    "bio" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_codes" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "public"."OtpPurpose" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."push_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_bookings" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_cart" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_event_days" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_event_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_favorites" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_formats" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_payments" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" "public"."PaymentProvider" NOT NULL,
    "provider_payment_id" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "confirmation_url" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "seminar_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_photos" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seminar_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminar_views" (
    "id" SERIAL NOT NULL,
    "seminar_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seminar_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seminars" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT,
    "city" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "event_time" TEXT NOT NULL,
    "contact_phone" TEXT,
    "secondary_phone" TEXT,
    "contact_email" TEXT,
    "contact_telegram" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "organizer_id" INTEGER NOT NULL,
    "lecturer_id" INTEGER NOT NULL,
    "format_id" INTEGER NOT NULL,
    "specialty_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "seminars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."specialties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "phone" TEXT,
    "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "telegram_id" TEXT,
    "telegram_username" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "company_name" TEXT,
    "referral_code" TEXT,
    "specialty_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lecturers_user_id_key" ON "public"."lecturers"("user_id" ASC);

-- CreateIndex
CREATE INDEX "otp_codes_expires_at_idx" ON "public"."otp_codes"("expires_at" ASC);

-- CreateIndex
CREATE INDEX "otp_codes_phone_purpose_idx" ON "public"."otp_codes"("phone" ASC, "purpose" ASC);

-- CreateIndex
CREATE INDEX "push_tokens_device_id_idx" ON "public"."push_tokens"("device_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_user_id_device_id_key" ON "public"."push_tokens"("user_id" ASC, "device_id" ASC);

-- CreateIndex
CREATE INDEX "push_tokens_user_id_idx" ON "public"."push_tokens"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_bookings_payment_id_key" ON "public"."seminar_bookings"("payment_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_bookings_seminar_id_idx" ON "public"."seminar_bookings"("seminar_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_bookings_seminar_id_user_id_key" ON "public"."seminar_bookings"("seminar_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_bookings_status_idx" ON "public"."seminar_bookings"("status" ASC);

-- CreateIndex
CREATE INDEX "seminar_bookings_user_id_idx" ON "public"."seminar_bookings"("user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_cart_seminar_id_idx" ON "public"."seminar_cart"("seminar_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_cart_seminar_id_user_id_key" ON "public"."seminar_cart"("seminar_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_cart_user_id_idx" ON "public"."seminar_cart"("user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_event_days_date_idx" ON "public"."seminar_event_days"("date" ASC);

-- CreateIndex
CREATE INDEX "seminar_event_days_seminar_id_idx" ON "public"."seminar_event_days"("seminar_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_favorites_seminar_id_idx" ON "public"."seminar_favorites"("seminar_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_favorites_seminar_id_user_id_key" ON "public"."seminar_favorites"("seminar_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_favorites_user_id_idx" ON "public"."seminar_favorites"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_formats_name_key" ON "public"."seminar_formats"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_payments_provider_payment_id_key" ON "public"."seminar_payments"("provider_payment_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_payments_seminar_id_idx" ON "public"."seminar_payments"("seminar_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_payments_status_idx" ON "public"."seminar_payments"("status" ASC);

-- CreateIndex
CREATE INDEX "seminar_payments_user_id_idx" ON "public"."seminar_payments"("user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_photos_seminar_id_idx" ON "public"."seminar_photos"("seminar_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_photos_seminar_id_order_idx" ON "public"."seminar_photos"("seminar_id" ASC, "order" ASC);

-- CreateIndex
CREATE INDEX "seminar_views_created_at_idx" ON "public"."seminar_views"("created_at" ASC);

-- CreateIndex
CREATE INDEX "seminar_views_seminar_id_idx" ON "public"."seminar_views"("seminar_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "seminar_views_seminar_id_user_id_key" ON "public"."seminar_views"("seminar_id" ASC, "user_id" ASC);

-- CreateIndex
CREATE INDEX "seminar_views_user_id_idx" ON "public"."seminar_views"("user_id" ASC);

-- CreateIndex
CREATE INDEX "seminars_city_idx" ON "public"."seminars"("city" ASC);

-- CreateIndex
CREATE INDEX "seminars_event_date_idx" ON "public"."seminars"("event_date" ASC);

-- CreateIndex
CREATE INDEX "seminars_format_id_idx" ON "public"."seminars"("format_id" ASC);

-- CreateIndex
CREATE INDEX "seminars_lecturer_id_idx" ON "public"."seminars"("lecturer_id" ASC);

-- CreateIndex
CREATE INDEX "seminars_organizer_id_idx" ON "public"."seminars"("organizer_id" ASC);

-- CreateIndex
CREATE INDEX "seminars_specialty_id_idx" ON "public"."seminars"("specialty_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "specialties_name_key" ON "public"."specialties"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "public"."users"("telegram_id" ASC);

-- AddForeignKey
ALTER TABLE "public"."lecturers" ADD CONSTRAINT "lecturers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."push_tokens" ADD CONSTRAINT "push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_bookings" ADD CONSTRAINT "seminar_bookings_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."seminar_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_bookings" ADD CONSTRAINT "seminar_bookings_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_bookings" ADD CONSTRAINT "seminar_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_cart" ADD CONSTRAINT "seminar_cart_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_cart" ADD CONSTRAINT "seminar_cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_event_days" ADD CONSTRAINT "seminar_event_days_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_favorites" ADD CONSTRAINT "seminar_favorites_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_favorites" ADD CONSTRAINT "seminar_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_payments" ADD CONSTRAINT "seminar_payments_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_payments" ADD CONSTRAINT "seminar_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_photos" ADD CONSTRAINT "seminar_photos_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_views" ADD CONSTRAINT "seminar_views_seminar_id_fkey" FOREIGN KEY ("seminar_id") REFERENCES "public"."seminars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminar_views" ADD CONSTRAINT "seminar_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminars" ADD CONSTRAINT "seminars_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "public"."seminar_formats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminars" ADD CONSTRAINT "seminars_lecturer_id_fkey" FOREIGN KEY ("lecturer_id") REFERENCES "public"."lecturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminars" ADD CONSTRAINT "seminars_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seminars" ADD CONSTRAINT "seminars_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_specialty_id_fkey" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

