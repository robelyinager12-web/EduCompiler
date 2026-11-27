import bcrypt from "bcrypt";
import { env } from "../config/env";

// A low cost keeps the test suite fast. Real runs use 12.
const COST = env.NODE_ENV === "test" ? 4 : 12;

export const hashPassword = (password: string): Promise<string> => bcrypt.hash(password, COST);

export const verifyPassword = (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

// Used when the email is unknown, so the response takes as long as a real check.
let dummyHash: Promise<string> | undefined;
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= bcrypt.hash("dummy-password", COST);
  await bcrypt.compare(password, await dummyHash);
}
