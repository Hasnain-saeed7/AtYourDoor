# 🚪 TrustHire (AtYourDoor)

Pakistan's most trusted and reliable home services platform. TrustHire connects households with verified, background-checked skilled workers (plumbers, electricians, tailors, and more) within minutes.  

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=flat&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)

## ✨ Key Features

- **🛡️ CNIC Verified Workers:** Every worker's identity is strictly verified against national databases.
- **🌐 Bilingual Support:** Native English & Urdu interface tailored for the Pakistani demographic.
- **🤖 AI Assistant:** Integrated AI chatbot to handle bookings, answer queries, and guide users.
- **👥 Dual Portals:** Distinct dashboards and tailored experiences for Customers and Workers.
- **💸 Secure & Transparent Payments:** Book with confidence. Pay only after the job is completed.
- **⭐ Rating & Review System:** Built-in accountability. Workers must maintain a >3.5 star rating.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Supabase / Neon / Vercel Postgres)
- **Authentication:** NextAuth.js
- **Media/Images:** Cloudinary (implied via config)

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/TrustHire.git
cd TrustHire
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add the following required keys:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_secret_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Add any additional API keys below (e.g. AI provider, MapBox, Pusher)
```

### 4. Database Setup

Synchronize your schema with the database and seed initial data:

```bash
npx prisma generate
npx prisma db push
npm run seed  # If you have a seed script defined in package.json
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the platform.

## 📂 Project Structure

- `/src/app` - Next.js App Router pages and API routes.
- `/src/components` - Reusable UI components (Navbar, Footer, ChatWidget, etc.).
- `/src/lib` - Utility functions, Prisma client, Authentication config, Translations.
- `/src/context` - React Context providers (e.g., Language Context).
- `/prisma` - Database schema and migration settings.

## 🛡️ License

This project is licensed under the MIT License - see the LICENSE file for details.

