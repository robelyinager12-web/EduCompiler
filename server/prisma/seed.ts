import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Administrator", email, passwordHash, role: "ADMIN" },
  });

  const lessons = [
    {
      title: "What is a compiler?",
      description: "The big picture of how source code becomes a program.",
      content:
        "A compiler translates source code written by a human into another form, such as machine code. It works in phases: lexical analysis, syntax analysis, semantic analysis, intermediate code, optimization and code generation.",
      category: "Introduction",
      difficulty: "BEGINNER" as const,
    },
    {
      title: "Lexical analysis and tokens",
      description: "How the lexer turns characters into tokens.",
      content:
        "The lexer reads source code character by character and groups characters into tokens such as keywords, identifiers, numbers and operators. It ignores whitespace and comments.",
      category: "Lexical Analysis",
      difficulty: "BEGINNER" as const,
    },
  ];

  for (const lesson of lessons) {
    const existing = await prisma.lesson.findFirst({ where: { title: lesson.title } });
    if (!existing) await prisma.lesson.create({ data: lesson });
  }

  console.log(`Seed complete. Admin: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());