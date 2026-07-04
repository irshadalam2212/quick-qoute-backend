import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.unit.createMany({
    skipDuplicates: true,
    data: [
      { name: "Square Feet", shortName: "sqft", category: "Area" },
      { name: "Square Meter", shortName: "sqm", category: "Area" },
      { name: "Running Feet", shortName: "rft", category: "Length" },
      { name: "Meter", shortName: "m", category: "Length" },
      { name: "Millimeter", shortName: "mm", category: "Length" },
      { name: "Centimeter", shortName: "cm", category: "Length" },
      { name: "Kilogram", shortName: "kg", category: "Weight" },
      { name: "Ton", shortName: "ton", category: "Weight" },
      { name: "Number", shortName: "nos", category: "Count" },
      { name: "Piece", shortName: "pcs", category: "Count" },
      { name: "Bag", shortName: "bag", category: "Packaging" },
      { name: "Litre", shortName: "ltr", category: "Volume" },
      { name: "Cubic Feet", shortName: "cft", category: "Volume" },
      { name: "Cubic Meter", shortName: "cum", category: "Volume" },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });