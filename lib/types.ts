export type ReleaseStatus = "deployed" | "rollback" | "failed";
export type ReleaseEnvironment = "production" | "staging" | "preview";

export interface Release {
  id: string;  // UUID
  version: string;
  environment: ReleaseEnvironment;
  title: string;
  description: string | null;
  status: ReleaseStatus;
  deployed_by: string | null;
  deployed_at: string;
  created_at: string;
}

export interface ReleasePR {
  id: string;
  release_id: string;
  service: "fe" | "be";
  pr_number: number;
  pr_title: string;
  pr_url: string;
  pr_author: string;
}

export interface ReleaseDetail extends Release {
  fe_commit: string | null;
  fe_commit_url: string | null;
  fe_vercel_url: string | null;
  fe_status: ReleaseStatus | null;
  be_commit: string | null;
  be_commit_url: string | null;
  be_actions_url: string | null;
  be_status: ReleaseStatus | null;
  prs: ReleasePR[];
}
