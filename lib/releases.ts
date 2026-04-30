import type { Release } from "./types";

// ---------------------------------------------------------------------------
// Mock data — replace with GitHub API / DB calls in Phase 2
// ---------------------------------------------------------------------------
// To connect real GitHub data:
//   1. Set GITHUB_TOKEN in .env.local (fine-grained PAT, read:contents scope)
//   2. Set GITHUB_FE_REPO=bigfuture/open-director-frontend
//   3. Set GITHUB_BE_REPO=bigfuture/open_directors
//   4. Call fetchGitHubReleases() below instead of returning MOCK_RELEASES
// ---------------------------------------------------------------------------

const FE_REPO = "bigfuture/open-director-frontend";
const BE_REPO = "bigfuture/open_directors";

const MOCK_RELEASES: Release[] = [
  {
    id: "rel-003",
    version: "v1.3.0",
    environment: "production",
    deployed_at: "2026-04-25T09:00:00Z",
    deployed_by: "nataliehoang",
    notes: "Package system improvements and director profile updates",
    fe: {
      status: "success",
      vercel_url: "https://app.opendirector.com",
      commit: "f86dfc5",
      commit_url: `https://github.com/${FE_REPO}/commit/f86dfc5`,
      prs: [
        { number: 234, title: "feat: director personal details demographics", url: `https://github.com/${FE_REPO}/pull/234`, author: "nataliehoang" },
        { number: 231, title: "feat: package system Free/Premium/Internal tiers", url: `https://github.com/${FE_REPO}/pull/231`, author: "nataliehoang" },
      ],
    },
    be: {
      status: "success",
      actions_url: null,
      commit: "a3bc12f",
      commit_url: `https://github.com/${BE_REPO}/commit/a3bc12f`,
      prs: [
        { number: 89, title: "fix: club LTI restricted shares calculation", url: `https://github.com/${BE_REPO}/pull/89`, author: "nataliehoang" },
        { number: 87, title: "feat: club LTI measurement period defaults", url: `https://github.com/${BE_REPO}/pull/87`, author: "nataliehoang" },
      ],
    },
  },
  {
    id: "rel-002",
    version: "v1.2.1",
    environment: "production",
    deployed_at: "2026-04-22T14:30:00Z",
    deployed_by: "nataliehoang",
    notes: null,
    fe: {
      status: "success",
      vercel_url: "https://open-director-frontend-bcd2345.vercel.app",
      commit: "bcd2345",
      commit_url: `https://github.com/${FE_REPO}/commit/bcd2345`,
      prs: [
        { number: 228, title: "fix: export PDF formatting on Safari", url: `https://github.com/${FE_REPO}/pull/228`, author: "nataliehoang" },
      ],
    },
    be: {
      status: "success",
      actions_url: null,
      commit: "c4de345",
      commit_url: `https://github.com/${BE_REPO}/commit/c4de345`,
      prs: [
        { number: 85, title: "fix: remuneration report rounding precision", url: `https://github.com/${BE_REPO}/pull/85`, author: "nataliehoang" },
      ],
    },
  },
  {
    id: "rel-001-stg",
    version: "v1.2.0",
    environment: "staging",
    deployed_at: "2026-04-20T10:00:00Z",
    deployed_by: "nataliehoang",
    notes: "Club executive remuneration LTI UI",
    fe: {
      status: "success",
      vercel_url: "https://open-director-frontend-abc1234.vercel.app",
      commit: "abc1234",
      commit_url: `https://github.com/${FE_REPO}/commit/abc1234`,
      prs: [
        { number: 225, title: "feat: club LTI opportunity roll-up and preview", url: `https://github.com/${FE_REPO}/pull/225`, author: "nataliehoang" },
        { number: 222, title: "feat: club admin backend integration", url: `https://github.com/${FE_REPO}/pull/222`, author: "nataliehoang" },
      ],
    },
    be: {
      status: "success",
      actions_url: null,
      commit: "def5678",
      commit_url: `https://github.com/${BE_REPO}/commit/def5678`,
      prs: [
        { number: 82, title: "feat: club admin portal endpoints", url: `https://github.com/${BE_REPO}/pull/82`, author: "nataliehoang" },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getReleases(): Promise<Release[]> {
  // TODO: replace with real GitHub API + DB query
  // const token = process.env.GITHUB_TOKEN;
  // if (token) return fetchGitHubReleases(token);
  return MOCK_RELEASES;
}

export async function getRelease(id: string): Promise<Release | null> {
  const releases = await getReleases();
  return releases.find((r) => r.id === id) ?? null;
}
