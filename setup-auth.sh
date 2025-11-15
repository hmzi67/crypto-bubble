#!/bin/bash

# Market Bubbles - Authentication Setup Script
# This script helps you set up the authentication system

echo "🚀 Market Bubbles - Authentication Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please update the following variables in .env:"
    echo "   - DATABASE_URL (get from https://neon.tech)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - EMAIL_SERVER_* (your SMTP credentials)"
    echo ""
    read -p "Press Enter to continue after updating .env..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up Prisma..."
npx prisma generate

echo ""
echo "📊 Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Make sure your .env file is configured correctly"
echo "   2. Run: npm run dev"
echo "   3. Visit: http://localhost:3000"
echo "   4. Click 'Sign Up' to create an account"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICK_START_AUTH.md"
echo "   - Full Guide: AUTH_SETUP.md"
echo ""
echo "Happy coding! 🎉"
