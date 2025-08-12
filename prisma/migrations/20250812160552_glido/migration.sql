/*
  Warnings:

  - Added the required column `response` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Chat" ADD COLUMN     "response" JSONB NOT NULL;
