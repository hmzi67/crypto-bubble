import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // Create subscriptions for all users without one
  const usersWithoutSubs = await prisma.user.findMany({
    where: {
      subscription: null,
    },
  });

  for (const user of usersWithoutSubs) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: "FREE",
        status: "ACTIVE",
      },
    });
    console.log(`Created FREE subscription for user: ${user.email}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
