#!/bin/bash

# Dubai Wealth Hub - iOS Sync Script
# Run this after making changes in Lovable to update your Xcode project

echo "🔄 Starting iOS sync process..."

# Step 1: Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo "❌ Git pull failed. Please resolve conflicts manually."
    exit 1
fi

# Step 2: Install/update dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed."
    exit 1
fi

# Step 3: Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed."
    exit 1
fi

# Step 4: Sync to iOS
echo "📱 Syncing to iOS..."
npx cap sync ios
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed."
    exit 1
fi

echo "✅ iOS sync complete! Open Xcode to run on your device."
echo "💡 Run: npx cap open ios"
