import { sql } from "./db";
import type { Release } from "./types";

export async function getReleases(): Promise<Release[]> {
  const rows = await sql`
    SELECT id, version, environment, title, description, status,
           commit_sha, commit_msg, deployed_by,
           deployed_at::text, created_at::text
    FROM releases
    ORDER BY deployed_at DESC
  `;
  return rows as Release[];
}

export async function getRelease(id: number): Promise<Release | null> {
  const rows = await sql`
    SELECT id, version, environment, title, description, status,
           commit_sha, commit_msg, deployed_by,
           deployed_at::text, created_at::text
    FROM releases
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as Release) ?? null;
}
