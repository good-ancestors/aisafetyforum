# Neon Database Setup with Vercel

This project uses Neon (serverless PostgreSQL) as the database, integrated with Vercel.

## Neon ↔ Vercel Integration

The database connection is managed through Vercel's Neon integration, which automatically provides the required environment variables.

### How It Works

1. **Neon Integration in Vercel:**
   - Go to your Vercel project → Integrations
   - Add the Neon integration
   - Connect your Neon database
   - Vercel automatically injects these environment variables:
     - `DATABASE_URL` - Direct connection string
     - `POSTGRES_PRISMA_URL` - Prisma-optimized connection with connection pooling
     - `POSTGRES_URL` - Standard PostgreSQL connection
     - `POSTGRES_URL_NON_POOLING` - Direct connection without pooling

2. **Which Variables Are Used:**
   - **`DATABASE_URL`** - Used by the application (via `lib/prisma.ts`)
   - **`POSTGRES_PRISMA_URL`** - Used by Prisma migrations and introspection
   - The Neon integration ensures both are set correctly

### SSL Configuration

**Important:** Neon requires SSL connections. The Vercel integration automatically handles this, but if you're setting DATABASE_URL manually, ensure it includes the SSL parameter:

```
postgresql://user:pass@host/db?sslmode=require
```

Or for stricter security:

```
postgresql://user:pass@host/db?sslmode=verify-full
```

### SSL Warning

You may see this warning in logs:

```
Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca'
are treated as aliases for 'verify-full'.
```

**This is informational only** - it indicates that the PostgreSQL client library will treat these SSL modes as `verify-full` in future versions. Your connection is secure.

**To silence the warning:**
- Update your Neon connection string to explicitly use `sslmode=verify-full`
- Or add `uselibpqcompat=true&sslmode=require` for libpq compatibility

## Local Development

For local development, you can:

1. **Use Vercel environment variables:**
   ```bash
   vercel env pull .env.local
   ```
   This pulls the Neon connection strings from your Vercel project.

2. **Or connect directly to Neon:**
   - Get your connection string from the Neon dashboard
   - Add it to `.env.local`:
     ```env
     DATABASE_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"
     ```

## Database Schema Management

### Applying Migrations

**Production/Vercel:**
```bash
npx prisma migrate deploy
```
This is handled automatically in the build process via `postinstall` script.

**Local Development:**
```bash
npx prisma migrate dev
```

### Generating Prisma Client

The Prisma Client is automatically generated during:
- `npm install` (via postinstall script)
- `npm run build` (explicitly called)

### Viewing Data

Use Prisma Studio to view/edit data:
```bash
npx prisma studio
```

## Environment Variable Checklist

When setting up the Neon integration:

- ✅ Neon project created
- ✅ Neon integration added to Vercel project
- ✅ `DATABASE_URL` automatically set by Vercel
- ✅ `POSTGRES_PRISMA_URL` automatically set by Vercel
- ✅ Connection uses SSL (`sslmode=require` or `verify-full`)

## Troubleshooting

### "No DATABASE_URL" Error
- Verify Neon integration is connected in Vercel
- Check environment variables in Vercel project settings
- Run `vercel env pull` to sync locally

### SSL Connection Errors
- Ensure connection string includes `sslmode=require`
- Neon requires SSL - plain connections will fail
- Check if firewall/proxy is blocking SSL connections

### Connection Timeouts
- Neon auto-suspends inactive databases (free tier)
- First connection after suspension may take 1-2 seconds
- Use connection pooling (`POSTGRES_PRISMA_URL`) for better performance

## Connection Pooling

Neon provides two connection modes:

1. **Pooled Connection** (`POSTGRES_PRISMA_URL`)
   - Uses PgBouncer for connection pooling
   - Recommended for serverless environments (Vercel)
   - Handles high concurrency better
   - Default for the application

2. **Direct Connection** (`DATABASE_URL`)
   - Direct connection to database
   - Use for migrations and Prisma Studio
   - Lower latency but fewer concurrent connections

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel + Neon Integration](https://vercel.com/integrations/neon)
- [Prisma with Neon](https://www.prisma.io/docs/guides/database/neon)
- [PostgreSQL SSL Modes](https://www.postgresql.org/docs/current/libpq-ssl.html)
