import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

const FE_REPO = "bigfuture/open-director-frontend";
const BE_REPO = "bigfuture/open_directors";

async function migrate() {
  console.log("Running migrations...");

  // Core releases table
  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id            SERIAL PRIMARY KEY,
      version       VARCHAR(50)  NOT NULL,
      environment   VARCHAR(20)  NOT NULL CHECK (environment IN ('production', 'staging', 'preview')),
      title         TEXT         NOT NULL,
      description   TEXT,
      status        VARCHAR(20)  NOT NULL DEFAULT 'deployed' CHECK (status IN ('deployed', 'rollback', 'failed')),
      -- FE deployment
      fe_commit     VARCHAR(40),
      fe_commit_url TEXT,
      fe_vercel_url TEXT,
      fe_status     VARCHAR(20)  DEFAULT 'deployed' CHECK (fe_status IN ('deployed', 'rollback', 'failed')),
      -- BE deployment
      be_commit     VARCHAR(40),
      be_commit_url TEXT,
      be_actions_url TEXT,
      be_status     VARCHAR(20)  DEFAULT 'deployed' CHECK (be_status IN ('deployed', 'rollback', 'failed')),
      -- Meta
      deployed_by   TEXT,
      deployed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ releases table ready");

  // PRs table — multiple FE/BE PRs per release
  await sql`
    CREATE TABLE IF NOT EXISTS release_prs (
      id          SERIAL PRIMARY KEY,
      release_id  INTEGER      NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
      service     VARCHAR(5)   NOT NULL CHECK (service IN ('fe', 'be')),
      pr_number   INTEGER      NOT NULL,
      pr_title    TEXT         NOT NULL,
      pr_url      TEXT         NOT NULL,
      pr_author   TEXT         NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ release_prs table ready");

  // Seed
  const existing = await sql`SELECT COUNT(*) as count FROM releases`;
  if (Number(existing[0].count) === 0) {
    // Release 1 — v1.3.0 production
    const [r1] = await sql`
      INSERT INTO releases (version, environment, title, description, status,
        fe_commit, fe_commit_url, fe_vercel_url, fe_status,
        be_commit, be_commit_url, be_actions_url, be_status,
        deployed_by, deployed_at)
      VALUES (
        'v1.3.0', 'production',
        'Package system & director demographics',
        'Package tiers (Free / Premium / Internal) now live. Director personal details form includes full demographics. Club LTI bug fixes on BE.',
        'deployed',
        'f86dfc5', ${`https://github.com/${FE_REPO}/commit/f86dfc5`}, 'https://app.opendirector.com', 'deployed',
        'a3bc12f', ${`https://github.com/${BE_REPO}/commit/a3bc12f`}, null, 'deployed',
        'natalie', NOW() - INTERVAL '2 days'
      ) RETURNING id
    `;
    await sql`
      INSERT INTO release_prs (release_id, service, pr_number, pr_title, pr_url, pr_author) VALUES
        (${r1.id}, 'fe', 234, 'feat: director personal details demographics', ${`https://github.com/${FE_REPO}/pull/234`}, 'nataliehoang'),
        (${r1.id}, 'fe', 231, 'feat: package system Free/Premium/Internal tiers', ${`https://github.com/${FE_REPO}/pull/231`}, 'nataliehoang'),
        (${r1.id}, 'be', 89, 'fix: club LTI restricted shares calculation', ${`https://github.com/${BE_REPO}/pull/89`}, 'nataliehoang'),
        (${r1.id}, 'be', 87, 'feat: club LTI measurement period defaults', ${`https://github.com/${BE_REPO}/pull/87`}, 'nataliehoang')
    `;

    // Release 2 — v1.2.1 production
    const [r2] = await sql`
      INSERT INTO releases (version, environment, title, description, status,
        fe_commit, fe_commit_url, fe_vercel_url, fe_status,
        be_commit, be_commit_url, be_actions_url, be_status,
        deployed_by, deployed_at)
      VALUES (
        'v1.2.1', 'production',
        'Bug fixes — PDF export & remuneration rounding',
        'Safari PDF export formatting fixed. BE remuneration report rounding precision corrected.',
        'deployed',
        'bcd2345', ${`https://github.com/${FE_REPO}/commit/bcd2345`}, 'https://app.opendirector.com', 'deployed',
        'c4de345', ${`https://github.com/${BE_REPO}/commit/c4de345`}, null, 'deployed',
        'natalie', NOW() - INTERVAL '5 days'
      ) RETURNING id
    `;
    await sql`
      INSERT INTO release_prs (release_id, service, pr_number, pr_title, pr_url, pr_author) VALUES
        (${r2.id}, 'fe', 228, 'fix: export PDF formatting on Safari', ${`https://github.com/${FE_REPO}/pull/228`}, 'nataliehoang'),
        (${r2.id}, 'be', 85, 'fix: remuneration report rounding precision', ${`https://github.com/${BE_REPO}/pull/85`}, 'nataliehoang')
    `;

    // Release 3 — v1.2.0 staging
    const [r3] = await sql`
      INSERT INTO releases (version, environment, title, description, status,
        fe_commit, fe_commit_url, fe_vercel_url, fe_status,
        be_commit, be_commit_url, be_actions_url, be_status,
        deployed_by, deployed_at)
      VALUES (
        'v1.2.0', 'staging',
        'Club executive remuneration — LTI UI',
        'LTI opportunity roll-up and preview modal. Club admin backend integration. Admin portal endpoints for clubs.',
        'deployed',
        'abc1234', ${`https://github.com/${FE_REPO}/commit/abc1234`}, 'https://open-director-frontend-abc1234.vercel.app', 'deployed',
        'def5678', ${`https://github.com/${BE_REPO}/commit/def5678`}, null, 'deployed',
        'natalie', NOW() - INTERVAL '7 days'
      ) RETURNING id
    `;
    await sql`
      INSERT INTO release_prs (release_id, service, pr_number, pr_title, pr_url, pr_author) VALUES
        (${r3.id}, 'fe', 225, 'feat: club LTI opportunity roll-up and preview', ${`https://github.com/${FE_REPO}/pull/225`}, 'nataliehoang'),
        (${r3.id}, 'fe', 222, 'feat: club admin backend integration', ${`https://github.com/${FE_REPO}/pull/222`}, 'nataliehoang'),
        (${r3.id}, 'be', 82, 'feat: club admin portal endpoints', ${`https://github.com/${BE_REPO}/pull/82`}, 'nataliehoang')
    `;

    console.log("✓ seeded 3 sample releases with PRs");
  } else {
    console.log("✓ releases already seeded — skipping");
  }

  console.log("Migrations complete.");
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
