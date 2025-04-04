# Database Setup Instructions

This project uses MongoDB with Prisma ORM for data persistence. Follow these steps to set up the database:

## Prerequisites

1. MongoDB Atlas account (or a local MongoDB server)
2. Node.js and npm installed

## Setup Steps

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the MongoDB connection details in the `.env` file:
   ```
   MONGODB_USER="your_mongodb_user"
   MONGODB_PASSWORD="your_mongodb_password"
   MONGODB_CLUSTER="your_cluster_url"
   MONGODB_DATABASE="malik_of_the_year"
   ```

3. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Push the schema to the database (creates collections if they don't exist):
   ```bash
   npm run prisma:migrate
   ```

5. (Optional) Seed the database with sample data:
   ```bash
   npm run db:seed
   ```

## Automatic Collection Creation

The application is configured to automatically check for and create collections on startup. This is done via:

1. The database initialization API endpoint (`/api/init-db`)
2. The DbInitProvider component that calls this endpoint when the app loads

To force database initialization in development mode, set `NEXT_PUBLIC_FORCE_DB_INIT="true"` in your `.env` file.

## Data Models

The application uses the following main data models:

1. **User** - Players and team captains
2. **Team** - Groups of players
3. **Competition** - Contains teams and games
4. **Game** - Individual competition events

## Migrating from Mock Data

If you've been using the application with mock data, the `db:seed` command will populate your database with that same sample data. This allows for a smooth transition without losing the structure of your test data. 