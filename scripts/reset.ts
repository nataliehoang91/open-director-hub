import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
const sql = neon(process.env.DATABASE_URL!);

async function reset() {
  await sql`DROP TABLE IF EXISTS release_prs`;
  await sql`DROP TABLE IF EXISTS releases`;
  console.log("✓ tables dropped");
  process.exit(0);
}

reset().catch(err => { console.error(err); process.exit(1); });
