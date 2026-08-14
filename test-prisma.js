const { PrismaClient } = require('./lib/generated/prisma')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  const email = "testuser_db_" + Date.now() + "@example.com"
  const passwordHash = await bcrypt.hash("password123", 10)
  
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: "Test User", email, passwordHash, role: "store_owner" },
      });
      console.log("User created:", user.id)

      const store = await tx.store.create({
        data: {
          slug: "testslug-" + Date.now(),
          name: "Test Store",
          siteType: "storefront",
          industry: "umum",
          templateId: "modern",
          ownerId: user.id,
          status: "trial",
        },
      });
      console.log("Store created:", store.id)

      await tx.storeSettings.create({ data: { storeId: store.id } });
      console.log("Settings created")
    })
    console.log("Transaction successful")
  } catch (e) {
    console.error("Prisma error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
