/*
  Warnings:

  - You are about to drop the `follow_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `follows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL');

-- DropForeignKey
ALTER TABLE "follow_requests" DROP CONSTRAINT "follow_requests_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "follow_requests" DROP CONSTRAINT "follow_requests_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "follows" DROP CONSTRAINT "follows_following_id_fkey";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_settings" DROP CONSTRAINT "user_settings_user_id_fkey";

-- DropTable
DROP TABLE "follow_requests";

-- DropTable
DROP TABLE "follows";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "user_settings";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "FollowRequestStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "request_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "query" JSONB,
    "params" JSONB,
    "headers" JSONB,
    "body" JSONB,
    "user_id" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "trace_id" TEXT,

    CONSTRAINT "request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL DEFAULT 'ERROR',
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "context" JSONB,
    "request_id" TEXT,
    "file" TEXT,
    "line" INTEGER,
    "function" TEXT,
    "service" TEXT NOT NULL DEFAULT 'api',
    "trace_id" TEXT,

    CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "ip" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resource_id" TEXT,
    "metadata" JSONB,
    "status" TEXT NOT NULL DEFAULT 'success',

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "request_logs_id_key" ON "request_logs"("id");

-- CreateIndex
CREATE INDEX "request_logs_user_id_idx" ON "request_logs"("user_id");

-- CreateIndex
CREATE INDEX "request_logs_trace_id_idx" ON "request_logs"("trace_id");

-- CreateIndex
CREATE INDEX "request_logs_timestamp_status_idx" ON "request_logs"("timestamp", "status");

-- CreateIndex
CREATE INDEX "request_logs_path_method_idx" ON "request_logs"("path", "method");

-- CreateIndex
CREATE UNIQUE INDEX "error_logs_id_key" ON "error_logs"("id");

-- CreateIndex
CREATE INDEX "error_logs_request_id_idx" ON "error_logs"("request_id");

-- CreateIndex
CREATE INDEX "error_logs_trace_id_idx" ON "error_logs"("trace_id");

-- CreateIndex
CREATE INDEX "error_logs_timestamp_level_idx" ON "error_logs"("timestamp", "level");

-- CreateIndex
CREATE INDEX "error_logs_name_idx" ON "error_logs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_id_key" ON "audit_logs"("id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_resource_idx" ON "audit_logs"("action", "resource");
