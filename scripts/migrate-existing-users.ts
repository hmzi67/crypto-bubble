import prisma from "../src/lib/prisma";

async function migrateExistingUsers() {
  console.log("Starting migration for existing users...");

  try {
    // Find all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${allUsers.length} total users`);

    // Find users without subscriptions
    const usersWithoutSubs = await prisma.user.findMany({
      where: {
        subscription: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${usersWithoutSubs.length} users without subscriptions`);

    if (usersWithoutSubs.length === 0) {
      console.log("✅ All users already have subscriptions!");
      return;
    }

    // Create FREE subscriptions for users without one
    for (const user of usersWithoutSubs) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planType: "FREE",
          status: "ACTIVE",
        },
      });
      console.log(`✅ Created FREE subscription for user: ${user.email}`);
    }

    console.log("\n🎉 Migration complete!");
    console.log(`✅ Created ${usersWithoutSubs.length} new subscriptions`);
    
    // Verify all users now have subscriptions
    const remainingUsers = await prisma.user.findMany({
      where: {
        subscription: null,
      },
    });

    if (remainingUsers.length === 0) {
      console.log("✅ Verified: All users now have subscriptions");
    } else {
      console.log(`⚠️  Warning: ${remainingUsers.length} users still without subscriptions`);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

migrateExistingUsers()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
