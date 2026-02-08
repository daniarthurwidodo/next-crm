#!/usr/bin/env pwsh
# Quick setup script for Stripe webhooks local testing

Write-Host "🔧 Stripe Webhook Local Testing Setup" -ForegroundColor Cyan
Write-Host ""

# Check if Stripe CLI is installed
Write-Host "Checking for Stripe CLI..." -ForegroundColor Yellow
$stripeExists = Get-Command stripe -ErrorAction SilentlyContinue

if (-not $stripeExists) {
    Write-Host "❌ Stripe CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Stripe CLI:" -ForegroundColor White
    Write-Host "  Windows (Chocolatey): choco install stripe-cli" -ForegroundColor Gray
    Write-Host "  macOS: brew install stripe/stripe-cli/stripe" -ForegroundColor Gray
    Write-Host "  Or download from: https://stripe.com/docs/stripe-cli" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ Stripe CLI found" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local - please fill in your values" -ForegroundColor Green
    Write-Host ""
}

# Check for required environment variables
$envContent = Get-Content ".env.local" -Raw
$missingVars = @()

if ($envContent -notmatch "STRIPE_SECRET_KEY=sk_") {
    $missingVars += "STRIPE_SECRET_KEY"
}
if ($envContent -notmatch "NEXT_PUBLIC_SUPABASE_URL=https://") {
    $missingVars += "NEXT_PUBLIC_SUPABASE_URL"
}
if ($envContent -notmatch "SUPABASE_SERVICE_ROLE_KEY=") {
    $missingVars += "SUPABASE_SERVICE_ROLE_KEY"
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Missing required environment variables in .env.local:" -ForegroundColor Red
    $missingVars | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "Please update .env.local with your credentials first." -ForegroundColor White
    exit 1
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start your Next.js dev server:" -ForegroundColor White
Write-Host "   bun dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In another terminal, start Stripe webhook forwarding:" -ForegroundColor White
Write-Host "   stripe listen --forward-to localhost:3000/api/webhooks/stripe" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Copy the webhook signing secret (whsec_...) to .env.local:" -ForegroundColor White
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_xxxxx" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Restart your dev server to load the new secret" -ForegroundColor White
Write-Host ""
Write-Host "5. Test with:" -ForegroundColor White
Write-Host "   stripe trigger checkout.session.completed" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Full setup guide: docs/WEBHOOK_SETUP.md" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to run the database migration
Write-Host "Would you like to see the database migration SQL? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'y') {
    Write-Host ""
    Write-Host "📄 Database Migration SQL:" -ForegroundColor Cyan
    Write-Host "Copy this to your Supabase SQL Editor:" -ForegroundColor White
    Write-Host ""
    Get-Content "migrations/001_create_user_subscriptions.sql"
    Write-Host ""
}

Write-Host "✅ Setup check complete!" -ForegroundColor Green
