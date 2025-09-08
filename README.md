This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


## Project setup
1. Install Core Dependencies

		npm install prisma @prisma/client @types/node

2. Railway Database Setup

	#### Create Railway Account & Database

		Go to railway.app and sign up/login

		Click "New Project"

		Select "Provision PostgreSQL" (not "Deploy from GitHub" - just the   	database)

		Wait for the database to be created (takes about 30 seconds)

		3.2: Get Your Database URL

		Click on your PostgreSQL service in the Railway dashboard
		Go to the "Connect" tab
		Copy the "DATABASE_URL" (it will look something like: postgresql://postgres:password@server.railway.app:5432/railway)

		3.3: Update Your Environment
		Paste the DATABASE_URL into your .env.local file, replacing the placeholder:

				DATABASE_URL="postgresql://postgres:your-actual-url-from-railway"

		Also generate a secret key for NEXTAUTH_SECRET. You can use this command in your terminal:

			openssl rand -base64 32

3. Initialize Prisma

		npx prisma init
	This creates a prisma folder with a schema.prisma file.

4. Test Database Connection

		npx prisma db push

5. Generate Prisma Client

		npx prisma generate
