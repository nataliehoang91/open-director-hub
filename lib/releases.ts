import { sql } from "./db";
import type { Release, ReleaseDetail } from "./types";

export async function getReleases(): Promise<Release[]> {
  const rows = await sql`
    SELECT id, version, environment, title, description, status,
           deployed_by, deployed_at::text, created_at::text
    FROM releases
    ORDER BY deployed_at DESC
  `;
  return rows as Release[];
}

export async function getReleaseDetail(id: number): Promise<ReleaseDetail | null> {
  const rows = await sql`
    SELECT id, version, environment, title, description, status,
           fe_commit, fe_commit_url, fe_vercel_url, fe_status,
           be_commit, be_commit_url, be_actions_url, be_status,
           deployed_by, deployed_at::text, created_at::text
    FROM releases
    WHERE id = ${id}
    LIMIT 1
  `;
  if (!rows[0]) return null;

  const prs = await sql`
    SELECT id, release_id, service, pr_number, pr_title, pr_url, pr_author
    FROM release_prs
    WHERE release_id = ${id}
    ORDER BY service, pr_number
  `;

  return { ...rows[0], prs } as ReleaseDetail;
}
