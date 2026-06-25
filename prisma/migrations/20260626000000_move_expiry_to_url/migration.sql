-- Move expiration from users to short links.
ALTER TABLE "User" DROP COLUMN IF EXISTS "expiresAt";
ALTER TABLE "Url" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);
