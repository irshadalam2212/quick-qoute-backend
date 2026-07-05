import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.Item.createMany({
    data: [
      // Civil Works
      {
        category: "civil_works",
        description:
          "Earth excavation in all types of soil including dressing and disposal.",
        unit: 4, // Cum
        baseRate: 350,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "civil_works",
        description:
          "Providing and laying PCC M10 including material, labour and curing.",
        unit: 4,
        baseRate: 5200,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "civil_works",
        description:
          "Providing and laying RCC M20 including centering, shuttering and reinforcement.",
        unit: 4,
        baseRate: 8500,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "civil_works",
        description: "230 mm thick brick masonry in cement mortar 1:6.",
        unit: 4,
        baseRate: 6900,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "civil_works",
        description: "115 mm thick brick masonry partition wall.",
        unit: 2, // Sqm
        baseRate: 1200,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Plaster
      {
        category: "plastering",
        description: "12 mm thick internal cement plaster in CM 1:4.",
        unit: 2,
        baseRate: 180,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "plastering",
        description: "20 mm external sand faced plaster.",
        unit: 2,
        baseRate: 240,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Flooring
      {
        category: "flooring",
        description:
          "Providing and laying vitrified floor tiles including adhesive and grout.",
        unit: 2,
        baseRate: 1350,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "flooring",
        description: "Providing and laying anti-skid ceramic floor tiles.",
        unit: 2,
        baseRate: 950,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "flooring",
        description: "Providing and laying granite flooring 18 mm thick.",
        unit: 2,
        baseRate: 2200,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // False Ceiling
      {
        category: "false_ceiling",
        description:
          "Providing and fixing gypsum board false ceiling with GI framework.",
        unit: 2,
        baseRate: 145,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Painting
      {
        category: "painting",
        description: "Providing and applying wall putty two coats.",
        unit: 2,
        baseRate: 38,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "painting",
        description:
          "Providing and applying premium acrylic emulsion paint two coats.",
        unit: 2,
        baseRate: 48,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "painting",
        description: "Providing and applying enamel paint on metal surfaces.",
        unit: 2,
        baseRate: 65,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Carpentry
      {
        category: "carpentry",
        description: "Providing and fixing laminate finish modular wardrobe.",
        unit: 2,
        baseRate: 1800,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "carpentry",
        description:
          "Providing and fixing modular kitchen cabinets with laminate finish.",
        unit: 2,
        baseRate: 2400,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Electrical
      {
        category: "electrical",
        description:
          "Providing and fixing modular switch with concealed wiring.",
        unit: 3, // Nos
        baseRate: 450,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "electrical",
        description: "Providing and fixing LED panel light 36W.",
        unit: 3,
        baseRate: 1650,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Plumbing
      {
        category: "plumbing",
        description: "Providing and laying CPVC water supply pipeline.",
        unit: 1, // Rft
        baseRate: 180,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "plumbing",
        description: "Providing and fixing western water closet complete.",
        unit: 3,
        baseRate: 6800,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },

      // Doors & Windows
      {
        category: "doors_windows",
        description: "Providing and fixing flush door with laminate finish.",
        unit: 3,
        baseRate: 12500,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
      {
        category: "doors_windows",
        description:
          "Providing and fixing powder coated aluminium sliding window.",
        unit: 2,
        baseRate: 9500,
        taxRate: 18,
        notes: "",
        createdById: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Scope of Work seeded successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
