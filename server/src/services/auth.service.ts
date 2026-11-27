import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { burnPasswordCheck, hashPassword, verifyPassword } from "../utils/password";
import { isPrismaCode } from "../utils/prismaErrors";
import type { LoginInput, RegisterInput } from "../validators/auth.validator";

const publicUser = { id: true, name: true, email: true, role: true, createdAt: true } as const;

export async function register(input: RegisterInput) {
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        role: "STUDENT", // always. Admins are created by the seed script only.
      },
      select: publicUser,
    });
    return { user, token: signToken(user.id) };
  } catch (error) {
    if (isPrismaCode(error, "P2002")) {
      throw new ApiError(409, "An account with this email already exists.");
    }
    throw error;
  }
}

export async function login(input: LoginInput) {
  const failure = new ApiError(401, "Invalid email or password.");

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    await burnPasswordCheck(input.password);
    throw failure;
  }
  if (!(await verifyPassword(input.password, user.passwordHash))) throw failure;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token: signToken(user.id),
  };
}
