import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const alias = "testalias";

  // cleanup the existing database
  await prisma.shortLink.delete({ where: { alias } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.shortLink.create({
    data: {
      alias,
      url: "example.org",
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
