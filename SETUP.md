# Quick Setup Guide

Follow these steps to get your Quotation Builder up and running.

## Prerequisites

Make sure you have installed:
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database running locally or remotely

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, and other dependencies.

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Update this with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/quotation_builder?schema=public"

# Generate a secure secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Update company information
NEXT_PUBLIC_COMPANY_NAME="Your Company Name"
NEXT_PUBLIC_COMPANY_ADDRESS="123 Main St, City, Country"
NEXT_PUBLIC_COMPANY_PHONE="+1 234 567 8900"
NEXT_PUBLIC_COMPANY_EMAIL="info@yourcompany.com"
```

**Important**: To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

### 3. Set Up the Database

Generate Prisma client:
```bash
npm run db:generate
```

Push the schema to your database:
```bash
npm run db:push
```

This creates all necessary tables in your PostgreSQL database.

### 4. Seed the Database (Optional but Recommended)

Run the seed script to create sample users and a business card product:

```bash
npm run db:seed
```

This creates:
- **Admin User**: admin@example.com / admin123
- **Manager User**: manager@example.com / manager123
- **Sale User**: sale@example.com / sale123
- **Sample Product**: Business Card with options

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Next Steps

### View the Database

Open Prisma Studio to view and edit your database:
```bash
npm run db:studio
```

This opens a visual database editor at [http://localhost:5555](http://localhost:5555)

### Build for Production

When ready to deploy:

```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues

If you can't connect to PostgreSQL:

1. Verify PostgreSQL is running:
   ```bash
   # On macOS with Homebrew
   brew services list

   # Start if not running
   brew services start postgresql@15
   ```

2. Check your DATABASE_URL format:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
   ```

3. Test connection manually:
   ```bash
   psql -U username -d quotation_builder
   ```

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

### Prisma Client Issues

If you encounter Prisma client errors, regenerate it:

```bash
npm run db:generate
```

### TypeScript Errors

If you see TypeScript errors after installation:

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

## Default Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Manager | manager@example.com | manager123 |
| Sale | sale@example.com | sale123 |

**Important**: Change these passwords in production!

## Project Structure

```
quotation-builder/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # UI components
├── lib/                  # Utility functions
│   ├── prisma.ts        # Database client
│   ├── auth.ts          # Auth configuration
│   ├── cost-engine.ts   # Cost calculations
│   └── pdf-generator.ts # PDF generation
├── prisma/              # Database schema & migrations
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── types/              # TypeScript types
```

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review [quote.md](./quote.md) for business requirements
- See [spec.md](./spec.md) for technical specifications

## Common Tasks

### Create a New User
```bash
npm run db:studio
```
Navigate to the `User` table and add a new record.

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### View Database Schema
```bash
npx prisma studio
```

### Generate Database Migration (for production)
```bash
npx prisma migrate dev --name your_migration_name
```

---

Happy coding! 🚀
