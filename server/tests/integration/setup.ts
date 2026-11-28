import "dotenv/config"; // loads server/.env, including TEST_DATABASE_URL

const devUrl = process.env.DATABASE_URL;
const devDirect = process.env.DIRECT_URL;
const testUrl = process.env.TEST_DATABASE_URL;

// Same database, whether pooled or direct, has the same host once "-pooler" is removed.
function databaseKey(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace("-pooler", "")}${parsed.pathname}`;
  } catch {
    return url;
  }
}

if (testUrl && [devUrl, devDirect].some((u) => u && databaseKey(u) === databaseKey(testUrl))) {
  throw new Error(
    "TEST_DATABASE_URL points to the same database as DATABASE_URL. Use a separate Neon branch.",
  );
}

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
process.env.JWT_EXPIRES_IN = "7d";
process.env.CLIENT_URL = "http://localhost:5173";
// Without TEST_DATABASE_URL a harmless value is used and every test is skipped.
process.env.DATABASE_URL = testUrl ?? "postgresql://skip:skip@localhost:5432/skip";
process.env.DIRECT_URL = process.env.TEST_DIRECT_URL ?? process.env.DATABASE_URL;
