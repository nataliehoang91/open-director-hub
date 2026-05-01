export type ReleaseStatus = "deployed" | "rollback" | "failed";
export type ReleaseEnvironment = "production" | "staging" | "preview";

// DB-backed release record — populated automatically via Vercel webhook (coming soon)
export interface Release {
  id: number;
  version: string;
  environment: ReleaseEnvironment;
  title: string;
  description: string | null;
  status: ReleaseStatus;
  commit_sha: string | null;
  commit_msg: string | null;
  deployed_by: string | null;
  deployed_at: string;   // ISO string from DB timestamptz
  created_at: string;
}
