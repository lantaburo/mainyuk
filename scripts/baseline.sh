#!/bin/bash
echo "Baselining production database..."

npx prisma migrate resolve --applied 20260728045639_init || true
npx prisma migrate resolve --applied 20260728071516_add_store_industry || true
npx prisma migrate resolve --applied 20260728101143_add_ai_settings || true
npx prisma migrate resolve --applied 20260728103051_add_store_payment_settings || true
npx prisma migrate resolve --applied 20260728144627_add_whatsapp_api_config || true
npx prisma migrate resolve --applied 20260729053916_add_operator_role || true
npx prisma migrate resolve --applied 20260730015451_add_seo_fields || true
npx prisma migrate resolve --applied 20260730052120_add_ai_html_generator_fields || true
npx prisma migrate resolve --applied 20260731062603_add_favicon_columns || true
npx prisma migrate resolve --applied 20260812164610_add_edu_models || true
npx prisma migrate resolve --applied 20260812165858_add_progress || true

echo "Resolving any failed state for the latest migration..."
npx prisma migrate resolve --rolled-back 20260816162026_add_difficulty_level || true

echo "Applying new migrations..."
npx prisma migrate deploy
