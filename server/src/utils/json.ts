import type { Prisma } from "@prisma/client";

// Converts compiler output to plain JSON that Prisma accepts for Json columns.
export const toJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

// Omitting a nullable Json column stores NULL.
export const optionalJson = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === null || value === undefined ? undefined : toJson(value);
