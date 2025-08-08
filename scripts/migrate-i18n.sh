#!/bin/bash

# MotoAuto.ch i18n Migration Script
# This script migrates existing pages to [locale] structure

set -e

echo "🌍 Starting MotoAuto.ch i18n migration..."

# Check if we are in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install next-intl
echo "📦 Installing next-intl..."
pnpm add next-intl@latest

# Create backup of current app structure
echo "🔄 Creating backup..."
if [ -d "app-backup" ]; then
    rm -rf app-backup
fi
cp -r app app-backup

# Create [locale] structure with existing pages
echo "📁 Creating [locale] structure..."
mkdir -p app/[locale]

# Copy existing static pages to [locale]
STATIC_PAGES=(
    "aukcje" 
    "cennik" 
    "faq" 
    "kontakt" 
    "ogloszenia" 
    "polityka-prywatnosci" 
    "regulamin"
    "conditions-generales" 
    "datenschutzrichtlinie" 
    "nutzungsbedingungen"
    "politique-confidentialite"
    "watchlist"
)

for page in "${STATIC_PAGES[@]}"; do
    if [ -d "app/$page" ]; then
        echo "Moving app/$page to app/[locale]/$page"
        mv "app/$page" "app/[locale]/$page"
    fi
done

# Keep some pages in root (api, auth, providers)
KEEP_IN_ROOT=("api" "auth" "(auth)" "providers" "(dashboard)")

echo "📂 Static pages moved to [locale] structure"
echo "📂 API routes and auth kept in root"

# Build the project to test
echo "🏗️  Testing build..."
if pnpm build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Rolling back..."
    rm -rf app
    mv app-backup app
    exit 1
fi

# Clean up backup if everything works
rm -rf app-backup

echo "✅ i18n migration completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update components to use useTranslations() hook"
echo "2. Replace hardcoded strings with translation keys" 
echo "3. Test all routes in all languages"
echo "4. Update links to use next-intl Link component"
echo ""
echo "🌐 Available routes:"
echo "- Polish (default): https://localhost:3000"
echo "- German: https://localhost:3000/de"
echo "- French: https://localhost:3000/fr" 
echo "- English: https://localhost:3000/en"
echo "- Italian: https://localhost:3000/it"