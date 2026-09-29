import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the first user (Admin)
  const user = await prisma.user.findFirst();

  if (!user) {
    throw new Error(
      "No user found. Please create a user before running the category seed."
    );
  }

  const categories = [
    {
      name: "Civil Work",
      code: "CIVIL",
      description:
        "Building construction, excavation, RCC, masonry, plastering and structural works.",
    },
    {
      name: "Interior Work",
      code: "INTERIOR",
      description:
        "Interior fit-out works including partitions, false ceiling, flooring and finishing.",
    },
    {
      name: "Electrical Work",
      code: "ELECTRICAL",
      description:
        "Electrical wiring, lighting, switchboards, panels and power distribution.",
    },
    {
      name: "Plumbing Work",
      code: "PLUMBING",
      description:
        "Water supply, drainage, sanitary fittings and plumbing installations.",
    },
    {
      name: "Furniture Work",
      code: "FURNITURE",
      description:
        "Modular furniture, wardrobes, kitchen, office furniture and carpentry.",
    },
    {
      name: "Flooring Work",
      code: "FLOORING",
      description:
        "Tile, marble, granite, wooden and vinyl flooring works.",
    },
    {
      name: "Painting Work",
      code: "PAINTING",
      description:
        "Interior and exterior painting, texture and polishing works.",
    },
    {
      name: "False Ceiling",
      code: "FALSE_CEILING",
      description:
        "Gypsum, POP, metal and wooden false ceiling works.",
    },
    {
      name: "MEP Work",
      code: "MEP",
      description:
        "Mechanical, Electrical and Plumbing works.",
    },
    {
      name: "HVAC",
      code: "HVAC",
      description:
        "Air conditioning, ventilation and ducting works.",
    },
    {
      name: "Fire Fighting",
      code: "FIRE_FIGHTING",
      description:
        "Fire hydrant, sprinkler and fire alarm systems.",
    },
    {
      name: "Fabrication Work",
      code: "FABRICATION",
      description:
        "Structural steel, MS, SS and aluminium fabrication.",
    },
    {
      name: "Waterproofing",
      code: "WATERPROOFING",
      description:
        "Terrace, basement and bathroom waterproofing works.",
    },
    {
      name: "Road Work",
      code: "ROAD",
      description:
        "Road construction, paving blocks and asphalt works.",
    },
    {
      name: "Demolition Work",
      code: "DEMOLITION",
      description:
        "Building dismantling and demolition works.",
    },
    {
      name: "Landscape Work",
      code: "LANDSCAPE",
      description:
        "Garden development, paving and plantation works.",
    },
    {
      name: "Glass Work",
      code: "GLASS",
      description:
        "Glass partitions, glazing and façade works.",
    },
    {
      name: "Aluminium Work",
      code: "ALUMINIUM",
      description:
        "Aluminium doors, windows and partition systems.",
    },
    {
      name: "Cleaning Work",
      code: "CLEANING",
      description:
        "Post-construction cleaning and housekeeping services.",
    },
    {
      name: "Miscellaneous",
      code: "MISC",
      description:
        "Other construction and interior works.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        code: category.code,
      },
      update: {},
      create: {
        ...category,
        createdBy: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  console.log(`✅ ${categories.length} categories seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });