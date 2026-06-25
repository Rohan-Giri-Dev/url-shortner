# 🔗 snipUrl - High-Performance URL Shortener & Analytics

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react&logoColor=61DAFB)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38BDF8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Clerk Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com)

**snipUrl** is a fast, secure, and modern URL shortener designed with a focus on seamless user experience, link lifecycle controls, and clean developer aesthetics. It provides anonymous shortening as well as full private workspace management with visual analytics using a pitch-black glassmorphic interface.

🚀 **Live Deployment**: [https://url-shortner-beryl-alpha.vercel.app/dashboard](https://url-shortner-beryl-alpha.vercel.app/dashboard)

---

## ✨ Features

- 👤 **Dual Workspace Architecture**: 
  - **Public Workspace**: Create temporary, secure short links without logging in.
  - **Private Workspace**: Connect your account via Clerk to persist links indefinitely and view click analytics.
- ⚡ **Auto-Expiry & Lifecycle Controls**: Default 24-hour expiration for security, with support for active database cleaning.
- 📊 **Real-time Analytics Dashboard**: Tracks total clicks, active links, and highlights the most-popular URL.
- 🔍 **Live Search Filter**: Search through shortened links instantly by original URL hostnames, shortcodes, or target destinations.
- 🖼️ **QR Code Generator**: Generates SVG QR codes instantly for each shortened link, ready for immediate download and sharing.
- 🛠️ **Automated Cron Engine**: Secured endpoint (`/api/cron/delete-expired-links`) that cleans up expired records to keep the database footprint lean.
- 🌌 **Premium Visual Aesthetics**: Dark-mode glassmorphic cards, glowing borders, smooth hover animations, and dynamic micro-interactions.

---

## 🛠️ Tech Stack & Key Libraries

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server-side API Route Handlers)
- **Frontend Logic**: [React 19](https://react.dev) (Modern Client Components, hooks, state synchronization)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com) (Utility-first system using native CSS nesting and modern layout variables)
- **Authentication**: [Clerk NextJS SDK](https://clerk.com) (Secure authentication middleware and customized User Button components)
- **Database ORM**: [Prisma Client](https://prisma.io) (PostgreSQL schema mapping and transaction safety)
- **Database Engine**: [PostgreSQL](https://postgresql.org) (Structured data handling with automatic cascade deletions)
- **Assets & Icons**: [Phosphor Icons React](https://phosphoricons.com) for vector icons
- **Utilities**: [qrcode](https://www.npmjs.com/package/qrcode) for dynamic QR rendering

---

## 📂 Core Codebase Structure

The project follows a standard Next.js App Router layout:

```text
├── prisma/
│   └── schema.prisma            # Database models for User and Url
├── lib/
│   ├── app-url.ts               # Short link host generators
│   ├── prisma.ts                # Prisma client singleton builder
│   └── short-code.ts            # Unique 6-character shortcode generator
├── src/
│   ├── proxy.ts                 # Clerk Authentication Middleware
│   ├── app/
│   │   ├── layout.tsx           # Global root shell
│   │   ├── page.tsx             # Redirect landing page to /dashboard
│   │   ├── globals.css          # Tailwind variables and utility overrides
│   │   ├── [shortCode]/         # Dynamically tracked redirection endpoint
│   │   │   └── route.ts         # Handles clicks tracking & expiry validation
│   │   ├── dashboard/           # UI View layouts (Public and User-based)
│   │   │   ├── page.tsx         # Public landing workspace
│   │   │   ├── me/              # Authentication sync logic
│   │   │   └── [userId]/        # Private dashboard entry point
│   │   ├── api/                 # REST API Handlers
│   │   │   ├── urls/            # Public CRUD operations
│   │   │   ├── users/           # User-linked dashboard operations
│   │   │   └── cron/            # Auto-clean cron hooks
│   │   └── components/          # Reusable UI parts
│   │       ├── DashboardExperience.tsx   # Core dashboard state & dashboard panels
│   │       ├── SignedUserPanel.tsx       # Auth control login/logout buttons
│   │       └── qr/                       # SVG QR code display renderer
```

---

## 🗄️ Database Models

Designed with Prisma, the PostgreSQL schema handles strict user-to-url mapping. Refer to the schema definition file here: [schema.prisma](file:///c:/Users/girir/Documents/url_shortner/prisma/schema.prisma)

```prisma
model User {
  id        String   @id // Clerk user ID (e.g. user_abc123)
  email     String?  @unique
  name      String?
  imageUrl  String?
  urls      Url[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Url {
  id          String   @id @default(uuid())
  originalUrl String
  shortCode   String   @unique
  clicks      Int      @default(0)
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  expiresAt   DateTime?
}
```

---

## 🔌 API Documentation

### 1. Link Redirection & Analytics
- **Endpoint**: `GET /[shortCode]`
- **Controller File**: [route.ts](file:///c:/Users/girir/Documents/url_shortner/src/app/%5BshortCode%5D/route.ts)
- **Logic**:
  - Look up matching `shortCode` in the database.
  - If the link has expired (`expiresAt < now`), delete it immediately and return `410 Gone`.
  - Otherwise, increment the `clicks` counter by 1.
  - Redirect the visitor to `originalUrl` using `NextResponse.redirect`.

### 2. Public Workspace API
- **Controller File**: [route.ts](file:///c:/Users/girir/Documents/url_shortner/src/app/api/urls/route.ts)
- **Endpoints**:
  - `POST /api/urls`: Generates an anonymous short link. Validates input using node standard URL class, assigns a 6-character shortcode, sets a 24h lifespan, and saves it.
  - `GET /api/urls`: Retrieves all public active URLs.

### 3. User Workspace API
- **Controller File**: [route.ts](file:///c:/Users/girir/Documents/url_shortner/src/app/api/users/%5BuserId%5D/urls/route.ts)
- **Endpoints**:
  - `POST /api/users/[userId]/urls`: Creates a short link associated with the signed-in user. Requires valid authorization matching the route parameter.
  - `GET /api/users/[userId]/urls`: Retrieves all active URLs generated by the specific logged-in user.

### 4. Background Expiry Cron Job
- **Controller File**: [route.ts](file:///c:/Users/girir/Documents/url_shortner/src/app/api/cron/delete-expired-links/route.ts)
- **Endpoint**: `GET /api/cron/delete-expired-links`
- **Security**: Uses a token matching `CRON_SECRET` sent via the `Authorization: Bearer <secret>` header.
- **Logic**: Executes a bulk delete `deleteMany` on URLs whose expiration timestamp is less than the current server time.

---

## 🚀 Local Development Setup

To run snipUrl on your local machine, follow these instructions:

### 1. Prerequisites
Ensure you have the following installed:
- Node.js (v18.x or newer) or [Bun](https://bun.sh/)
- A running PostgreSQL Database instance (local or hosted like Neon/Supabase)

### 2. Clone the Repository
```bash
git clone https://github.com/Rohan-Giri-Dev/url-shortner.git
cd url-shortner
```

### 3. Install Dependencies
```bash
npm install
# or
bun install
```

### 4. Setup Environment Variables
Create a file named `.env` in the root folder and populate it with the following configuration variables:
```env
# Database connection URL
DATABASE_URL="postgresql://username:password@localhost:5432/url_shortener?schema=public"

# Clerk authentication keys (Retrieve from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Optional cron authentication secret key
CRON_SECRET="your-custom-cron-token"
```

### 5. Initialize the Database Schema
Generate the client types and push the tables into your Postgres database using Prisma:
```bash
npx prisma db push
npx prisma generate
```

### 6. Run the Application
Start the development server:
```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🎨 UI Architecture Overview

The interface relies on the master dashboard controller: [DashboardExperience.tsx](file:///c:/Users/girir/Documents/url_shortner/src/app/components/DashboardExperience.tsx) which encapsulates:

1. **Stats Overview Grid**: Displays dynamic cards displaying metrics on usage trends.
2. **Interactive Form Input**: Features sleek loading state indicators, error notification borders, and automatic list updating.
3. **URL Management Cards**:
   - Displays truncated URLs, shortcodes, and relative expiry timing.
   - Embeds a click-to-copy button which changes into a checkmark icon to confirm copy success.
   - Integrates the QR code modal trigger from [QRCodeDisplay.tsx](file:///c:/Users/girir/Documents/url_shortner/src/app/components/qr/QRCodeDisplay.tsx).
4. **Header Navigation bar**: Houses [SignedUserPanel.tsx](file:///c:/Users/girir/Documents/url_shortner/src/app/components/SignedUserPanel.tsx) managing Clerk User Button layouts and quick toggle dashboard links.

---

## 🛡️ License

This project is licensed under the MIT License. Feel free to clone, modify, and deploy your own instances!
