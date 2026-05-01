import { sql } from "./db";
import type { Release, ReleaseDetail, ReleasePR } from "./types";

export async function getReleases(): Promise<(Release & { prs: ReleasePR[] })[]> {
  const releases = await sql`
    SELECT id::text, version, environment, title, description, status,
           deployed_by, deployed_at::text, created_at::text
    FROM releases
    ORDER BY deployed_at DESC
  `;
  if (releases.length === 0) return [];

  const prs = await sql`
    SELECT id::text, release_id::text, service, pr_number, pr_title, pr_url, pr_author
    FROM release_prs
    WHERE release_id = ANY(${releases.map(r => r.id)}::uuid[])
    ORDER BY service, pr_number
  `;

  return releases.map(r => ({
    ...r,
    prs: prs.filter(p => p.release_id === r.id),
  })) as (Release & { prs: ReleasePR[] })[];
}

export async function getReleaseDetail(id: string): Promise<ReleaseDetail | null> {
  const rows = await sql`
    SELECT id::text, version, environment, title, description, status,
           fe_commit, fe_commit_url, fe_vercel_url, fe_status,
           be_commit, be_commit_url, be_actions_url, be_status,
           deployed_by, deployed_at::text, created_at::text
    FROM releases
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  if (!rows[0]) return null;

  const prs = await sql`
    SELECT id::text, release_id::text, service, pr_number, pr_title, pr_url, pr_author
    FROM release_prs
    WHERE release_id = ${id}::uuid
    ORDER BY service, pr_number
  `;

  return { ...rows[0], prs } as ReleaseDetail;
}
