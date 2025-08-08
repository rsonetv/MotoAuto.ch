#!/bin/bash

# MotoAuto.ch Internationalization Setup Script
# This script sets up i18n for the project with comprehensive migration

set -e

echo "🌍 Setting up internationalization for MotoAuto.ch..."
echo "=================================================="

# Check if we are in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node --version)"
    exit 1
fi

# Install dependencies
echo "📦 Installing next-intl..."
pnpm add next-intl@latest

echo "📦 Installing additional i18n development dependencies..."
pnpm add -D @types/node

# Create directory structure
echo "📁 Creating i18n directory structure..."
mkdir -p i18n
mkdir -p messages  
mkdir -p types
mkdir -p lib/i18n
mkdir -p lib/database
mkdir -p components/i18n
mkdir -p app/[locale]
mkdir -p supabase/functions/auto-translate

# Backup existing app structure (if not already backed up)
if [ -d "app" ] && [ ! -d "app-backup" ]; then
    echo "💾 Creating backup of existing app structure..."
    cp -r app app-backup-$(date +%Y%m%d-%H%M%S)
fi

# Move existing pages to [locale] structure if not already moved
echo "🔄 Migrating app structure to [locale] folder..."
if [ -d "app" ] && [ ! -d "app/[locale]" ]; then
    # Create [locale] directory
    mkdir -p app/[locale]

    # List of pages to move to [locale]
    PAGES_TO_MOVE=(
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
        "politique-cookies"
        "cookie-richtlinie" 
        "cookies"
        "watchlist"
        "payment"
        "pricing"
        "jak-to-dziala"
        "how-it-works"
        "theme-test"
    )

    # Move pages that exist
    for page in "${PAGES_TO_MOVE[@]}"; do
        if [ -d "app/$page" ]; then
            echo "  Moving app/$page to app/[locale]/$page"
            mv "app/$page" "app/[locale]/$page"
        fi
    done

    # Move page.tsx if it exists in root
    if [ -f "app/page.tsx" ] && [ ! -f "app/[locale]/page.tsx" ]; then
        echo "  Moving app/page.tsx to app/[locale]/page.tsx"
        mv "app/page.tsx" "app/[locale]/page.tsx"
    fi
fi

# Check for package.json updates
echo "📝 Updating package.json scripts..."
if [ -f "package-updates.json" ]; then
    echo "Found package-updates.json - please manually merge the dependencies and scripts into package.json"
else
    echo "Warning: package-updates.json not found"
fi

# Update tsconfig.json paths
echo "🔧 Updating TypeScript configuration..."
if command -v jq &> /dev/null; then
    # Update tsconfig.json with i18n paths if jq is available
    jq '.compilerOptions.paths."i18n/*" = ["./i18n/*"] | .compilerOptions.paths."messages/*" = ["./messages/*"] | .include += ["i18n/**/*", "messages/**/*", "types/i18n.ts"]' tsconfig.json > tsconfig.tmp && mv tsconfig.tmp tsconfig.json
    echo "  Updated tsconfig.json paths for i18n"
else
    echo "  jq not found - please manually update tsconfig.json paths for i18n"
fi

# Set up environment variables
echo "🌐 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "  Created .env.local from example"
    else
        cat > .env.local << EOF
# i18n Configuration
NEXT_PUBLIC_DEFAULT_LOCALE=pl
NEXT_PUBLIC_BASE_URL=https://motoauto.ch

# Existing Supabase configuration (update with your values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Translation Service (optional)
DEEPL_API_KEY=your_deepl_api_key
EOF
        echo "  Created .env.local with default values"
    fi
fi

# Validate file structure
echo "✅ Validating i18n file structure..."
REQUIRED_FILES=(
    "next.config.ts"
    "middleware.ts"
    "i18n/request.ts"
    "i18n/routing.ts"
    "messages/pl.json"
    "messages/de.json"
    "types/i18n.ts"
    "lib/i18n/utils.ts"
    "app/[locale]/layout.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
    fi
done

# Test build
echo "🏗️  Testing build..."
if pnpm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the logs above for errors."
    echo "Common issues:"
    echo "1. Make sure all required files are present"
    echo "2. Check for TypeScript errors"
    echo "3. Ensure Supabase environment variables are set"
    exit 1
fi

echo ""
echo "🎉 i18n setup completed successfully!"
echo "=================================================="
echo ""
echo "📋 Next steps:"
echo "1. Update your existing components to use useTranslations() hook"
echo "2. Replace hardcoded strings with translation keys from messages files"
echo "3. Test all locale routes (/, /de, /fr, /en, /it)"
echo "4. Set up translation workflow with your team"
echo "5. Configure Supabase database with i18n schema"
echo ""
echo "🌐 Available locales after setup:"
echo "- Polish (default): https://motoauto.ch"
echo "- German: https://motoauto.ch/de"  
echo "- French: https://motoauto.ch/fr"
echo "- English: https://motoauto.ch/en"
echo "- Italian: https://motoauto.ch/it"
echo ""
echo "📚 Documentation:"
echo "- next-intl docs: https://next-intl-docs.vercel.app/"
echo "- Project setup guide: README-I18N.md"
echo ""
echo "🚀 Run 'pnpm dev' to start development server and test i18n!"