sed -i '' 's/await prisma.$transaction(async (tx) => {/try { await prisma.$transaction(async (tx) => {/' app/api/register/route.ts
sed -i '' 's/return NextResponse.json({ ok: true });/} catch (e) { return NextResponse.json({ error: String(e), stack: e instanceof Error ? e.stack : "" }, { status: 500 }); } return NextResponse.json({ ok: true });/' app/api/register/route.ts
