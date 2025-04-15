-- CreateEnum
CREATE TYPE "TagEnum" AS ENUM ('ISSUE', 'FEATURE');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubRepo" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "tag" "TagEnum" NOT NULL DEFAULT 'ISSUE';
