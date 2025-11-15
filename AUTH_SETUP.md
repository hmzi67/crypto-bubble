# Authentication Setup Guide

This document provides instructions for setting up and using the authentication system in Market Bubbles.

## Features

- ✅ Email/Password authentication
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based sessions with NextAuth.js
- ✅ PostgreSQL database with Prisma ORM
- ✅ Responsive and beautiful UI matching the landing page design
- ✅ Protected routes and user sessions

## Tech Stack

- **NextAuth.js** - Authentication for Next.js
- **Prisma** - Modern database toolkit and ORM
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Nodemailer** - Email sending
- **bcryptjs** - Password hashing

## Setup Instructions

### 1. Database Setup (Neon PostgreSQL)

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://username:password@hostname/database?sslmode=require`)
4. Create a `.env` file in the root of your project (copy from `.env.example`)
5. Add your database URL to the `.env` file:

```env
DATABASE_URL="your-neon-connection-string-here"
```

### 2. Environment Variables

Update your `.env` file with all required variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-secret-key-here"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# App URL
APP_URL="http://localhost:3000"
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

#### Email Configuration

For Gmail:

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an "App Password" for this application
4. Use that app password in `EMAIL_SERVER_PASSWORD`

For other providers (SendGrid, Mailgun, etc.), follow their documentation for SMTP credentials.

### 3. Database Migration

Run Prisma migrations to create the database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 4. Install Dependencies

All dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Authentication Pages

The following authentication pages have been created:

### Login Page

- **URL:** `/auth/login`
- **Features:**
  - Email and password login
  - Link to forgot password
  - Link to signup
  - Email verification check

### Signup Page

- **URL:** `/auth/signup`
- **Features:**
  - Create account with name, email, and password
  - Password confirmation
  - Email verification sent automatically
  - Success screen with instructions

### Forgot Password Page

- **URL:** `/auth/forgot-password`
- **Features:**
  - Request password reset link
  - Secure email-based reset
  - Success confirmation

### Reset Password Page

- **URL:** `/auth/reset-password?token=xxx`
- **Features:**
  - Token-based password reset
  - Password strength validation
  - Automatic redirect to login after success

### Verify Email Page

- **URL:** `/auth/verify-email?token=xxx`
- **Features:**
  - Automatic verification on page load
  - Token validation
  - Success/error feedback

## API Routes

### POST `/api/auth/signup`

Create a new user account and send verification email.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

### POST `/api/auth/verify-email`

Verify user's email address.

**Body:**

```json
{
  "token": "verification-token"
}
```

### POST `/api/auth/forgot-password`

Request password reset email.

**Body:**

```json
{
  "email": "user@example.com"
}
```

### POST `/api/auth/reset-password`

Reset password with token.

**Body:**

```json
{
  "token": "reset-token",
  "password": "newpassword"
}
```

### `/api/auth/[...nextauth]`

NextAuth.js API routes for authentication (handled by NextAuth).

## Using Authentication in Components

### Check if user is logged in

```tsx
"use client";

import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return <div>Welcome, {session.user.name}!</div>;
  }

  return <div>Please log in</div>;
}
```

### Protect a page (Server Component)

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return <div>Protected content</div>;
}
```

### Sign out

```tsx
"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
      Sign Out
    </button>
  );
}
```

## Database Schema

The Prisma schema includes the following models:

- **User** - User accounts with email, password, and verification status
- **Account** - OAuth accounts (for future OAuth providers)
- **Session** - User sessions
- **VerificationToken** - Email verification and password reset tokens

## Security Features

- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Email verification required before login
- ✅ Password reset tokens expire after 1 hour
- ✅ Email verification tokens expire after 24 hours
- ✅ Secure JWT sessions
- ✅ CSRF protection (built into NextAuth)
- ✅ SQL injection protection (Prisma)

## Design System

All authentication pages follow the Market Bubbles design system:

- **Colors:**

  - Background: Dark gradient (gray-900 to gray-800)
  - Primary: Blue to Purple gradient
  - Cards: Dark with subtle borders
  - Text: Light gray on dark backgrounds

- **Components:**
  - Gradient buttons
  - Glassmorphism effects
  - Consistent spacing and typography
  - Responsive design

## Troubleshooting

### Email not sending

- Check your email credentials in `.env`
- For Gmail, ensure "App Password" is used (not regular password)
- Check spam folder
- View server logs for detailed error messages

### Database connection issues

- Verify `DATABASE_URL` in `.env`
- Ensure Neon database is running
- Check network connection
- Run `npx prisma migrate dev` to apply migrations

### NextAuth errors

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear cookies and try again

### Token expired

- Email verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- Request a new verification/reset email

## Production Deployment

Before deploying to production:

1. Update environment variables in your hosting platform
2. Set `NEXTAUTH_URL` to your production domain
3. Use a production email service (SendGrid, Mailgun, etc.)
4. Enable SSL/TLS for all connections
5. Run database migrations: `npx prisma migrate deploy`
6. Set `NODE_ENV=production`

## Future Enhancements

Potential features to add:

- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] User profile management
- [ ] Password strength requirements
- [ ] Account deletion
- [ ] Email change with verification
- [ ] Login history/activity log
- [ ] Rate limiting for API routes
- [ ] Remember me functionality

## Support

If you encounter issues:

1. Check the console for error messages
2. Review the API route logs
3. Verify environment variables are set correctly
4. Check database connection and migrations
5. Review NextAuth.js documentation: https://next-auth.js.org
6. Review Prisma documentation: https://www.prisma.io/docs

---

**Built with ❤️ for Market Bubbles**
