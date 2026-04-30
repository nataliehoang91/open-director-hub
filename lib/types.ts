export type DeployStatus = "success" | "failed" | "in_progress" | "pending";

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  author: string;
}

export interface FEDeployment {
  status: DeployStatus;
  vercel_url: string | null;       // preview / prod URL
  commit: string;                  // git SHA (short)
  commit_url: string;
  prs: PullRequest[];
}

export interface BEDeployment {
  status: DeployStatus;
  actions_url: string | null;      // GitHub Actions run URL (added later)
  commit: string;
  commit_url: string;
  prs: PullRequest[];
}

export interface Release {
  id: string;
  version: string;                 // e.g. v1.2.3
  environment: "staging" | "production";
  deployed_at: string;             // ISO date string
  deployed_by: string;
  fe: FEDeployment;
  be: BEDeployment;
  notes: string | null;            // optional release notes
}
