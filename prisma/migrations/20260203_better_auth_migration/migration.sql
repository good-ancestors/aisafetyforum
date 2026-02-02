-- Better Auth Migration
-- This migration adds Better Auth tables and renames neonAuthUserId to authUserId

-- Create Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes for Better Auth tables
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");

-- Add foreign keys for Better Auth tables
DO $$ BEGIN
    ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rename neonAuthUserId to authUserId in Profile table (if exists)
-- First check if the old column exists and new column doesn't
DO $$
BEGIN
    -- If neonAuthUserId exists but authUserId doesn't, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'neonAuthUserId')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'authUserId') THEN
        ALTER TABLE "Profile" RENAME COLUMN "neonAuthUserId" TO "authUserId";
    END IF;

    -- If neither exists, add authUserId
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'authUserId')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'neonAuthUserId') THEN
        ALTER TABLE "Profile" ADD COLUMN "authUserId" TEXT;
    END IF;
END $$;

-- Create index on authUserId if it doesn't exist
CREATE INDEX IF NOT EXISTS "Profile_authUserId_idx" ON "Profile"("authUserId");

-- Create unique index on authUserId if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Profile_authUserId_key') THEN
        CREATE UNIQUE INDEX "Profile_authUserId_key" ON "Profile"("authUserId");
    END IF;
END $$;

-- Add other missing Profile columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'isAdmin') THEN
        ALTER TABLE "Profile" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'gender') THEN
        ALTER TABLE "Profile" ADD COLUMN "gender" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'dietaryRequirements') THEN
        ALTER TABLE "Profile" ADD COLUMN "dietaryRequirements" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'avatarUrl') THEN
        ALTER TABLE "Profile" ADD COLUMN "avatarUrl" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'bio') THEN
        ALTER TABLE "Profile" ADD COLUMN "bio" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'linkedin') THEN
        ALTER TABLE "Profile" ADD COLUMN "linkedin" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'twitter') THEN
        ALTER TABLE "Profile" ADD COLUMN "twitter" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'bluesky') THEN
        ALTER TABLE "Profile" ADD COLUMN "bluesky" TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Profile' AND column_name = 'website') THEN
        ALTER TABLE "Profile" ADD COLUMN "website" TEXT;
    END IF;
END $$;
