import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id          SERIAL PRIMARY KEY,
      version     VARCHAR(50)  NOT NULL,
      environment VARCHAR(20)  NOT NULL CHECK (environment IN ('production', 'staging', 'preview')),
      title       TEXT         NOT NULL,
      description TEXT,
      status      VARCHAR(20)  NOT NULL DEFAULT 'deployed' CHECK (status IN ('deployed', 'rollback', 'failed')),
      commit_sha  VARCHAR(40),
      commit_msg  TEXT,
      deployed_by TEXT,
      deployed_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ releases table ready");

  // Seed with sample data so the page isn't blank
  const existing = await sql`SELECT COUNT(*) as count FROM releases`;
  if (Number(existing[0].count) === 0) {
    await sql`
      INSERT INTO releases (version, environment, title, description, status, commit_sha, commit_msg, deployed_by, deployed_at)
      VALUES
        ('1.2.0', 'production', 'API reference & docs section',
         'Added full API reference page with Stripe-style layout, docs section with markdown rendering, and 3-mode theme toggle.',
         'deployed', 'b32718e', 'feat: add API reference, docs section, and theme system', 'natalie', NOW() - INTERVAL '2 hours'),
        ('1.1.0', 'production', 'Portal launch',
         'Initial release of the Open Director internal portal with release tracking and navigation.',
         'deployed', '802dfde', 'feat: initial portal scaffold', 'natalie', NOW() - INTERVAL '1 day'),
        ('1.2.1', 'staging', 'DB integration (in progress)',
         'Wiring up Neon database for persistent release tracking. Deployment webhook coming next.',
         'deployed', '157de8d', 'feat: add Neon DB and schema', 'natalie', NOW() - INTERVAL '10 minutes')
    `;
    console.log("✓ seeded sample releases");
  } else {
    console.log("✓ releases already seeded — skipping");
  }

  console.log("Migrations complete.");
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
