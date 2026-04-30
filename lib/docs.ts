import fs from "fs";
import path from "path";

export interface DocMeta {
  slug: string;
  title: string;
  category: "Engineering" | "Platform" | "Operations";
  description: string;
  repo: "FE" | "BE" | "Both";
}

const FE_DOCS_PATH = path.resolve(
  process.cwd(),
  "../open-director-frontend/docs"
);

export const DOC_MANIFEST: DocMeta[] = [
  {
    slug: "cicd-architecture",
    title: "CI/CD Architecture",
    category: "Platform",
    description: "Full pipeline diagram, PR flow, GitHub Releases, and approval gates.",
    repo: "Both",
  },
  {
    slug: "engineering-automation-proposal",
    title: "Engineering Automation Proposal",
    category: "Platform",
    description: "5-phase plan for CI, infrastructure, Docker/ECS, monitoring, and Sentinel migration.",
    repo: "Both",
  },
  {
    slug: "deployment-operations",
    title: "Deployment & Operations Guide",
    category: "Operations",
    description: "bin/prod CLI reference, access control, secrets management, and onboarding.",
    repo: "Both",
  },
  {
    slug: "be-section-permissions",
    title: "BE Section Permissions",
    category: "Engineering",
    description: "Frontend contract for admin section permissions — aligning FE/BE identity response.",
    repo: "FE",
  },
  {
    slug: "chatpdf-fiscal-year",
    title: "ChatPDF Fiscal Year (FE)",
    category: "Engineering",
    description: "How the frontend uses fiscal_year_end from BE for workspace and report dates.",
    repo: "FE",
  },
];

const FILE_MAP: Record<string, string> = {
  "cicd-architecture": "CICD_ARCHITECTURE.md",
  "engineering-automation-proposal": "ENGINEERING_AUTOMATION_PROPOSAL.md",
  "deployment-operations": "DEPLOYMENT_OPERATIONS.md",
  "be-section-permissions": "BE_SECTION_PERMISSIONS.md",
  "chatpdf-fiscal-year": "CHATPDF_FISCAL_YEAR_FE.md",
};

export function getDocContent(slug: string): string | null {
  const filename = FILE_MAP[slug];
  if (!filename) return null;
  const filePath = path.join(FE_DOCS_PATH, filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

export function getDocsByCategory() {
  const grouped: Record<string, DocMeta[]> = {};
  for (const doc of DOC_MANIFEST) {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
  }
  return grouped;
}
