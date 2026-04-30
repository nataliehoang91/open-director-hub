export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
export type TokenType = "admin_jwt" | "my_od_jwt" | "any_jwt" | "none";

export interface Parameter {
  name: string;
  in: "path" | "query" | "body" | "header";
  type: string;
  required: boolean;
  description: string;
  example?: string;
  enum?: string[];
}

export interface ResponseExample {
  status: number;
  description: string;
  body: string;
}

export interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  auth: boolean;
  token: TokenType;
  parameters?: Parameter[];
  requestBody?: { description: string; example: string };
  responses: ResponseExample[];
}

export interface ResourceGroup {
  id: string;
  title: string;
  basePrefix: string;   // URL prefix shown in sidebar + group header
  endpoints: Endpoint[];
}

export interface APICategory {
  id: string;
  title: string;       // internal name
  label: string;       // display label in UI
  description: string;
  badge: string;
  color: { badge: string; dot: string; active: string };
  groups: ResourceGroup[];
}

export const BASE_URL = "https://api.opendirector.com";

const j = (obj: object) => JSON.stringify(obj, null, 2);

export const API_CATEGORIES: APICategory[] = [

  // ── Auth ──────────────────────────────────────────────────────────────────────
  {
    id: "auth",
    title: "Authentication",
    label: "Authentication",
    description: "Token-based auth shared across all products.",
    badge: "Auth",
    color: {
      badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-700",
      dot: "bg-slate-400",
      active: "text-slate-800 dark:text-slate-200",
    },
    groups: [
      {
        id: "auth-tokens",
        title: "Tokens",
        basePrefix: "/api/v1/auth",
        endpoints: [
          {
            id: "auth-login",
            method: "POST",
            path: "/api/v1/auth/login",
            title: "Login",
            description: "Authenticate with email and password. Returns a bearer token. Pass the returned `token` as `Authorization: Bearer <token>` on subsequent requests.",
            auth: false,
            token: "none",
            requestBody: {
              description: "User credentials.",
              example: j({ email: "admin@opendirector.com", password: "••••••••" }),
            },
            responses: [
              { status: 200, description: "Success", body: j({ token: "eyJhbGci...", expires_at: "2026-04-29T10:00:00Z", user: { id: 1, email: "admin@opendirector.com", role: "super_admin" } }) },
              { status: 401, description: "Invalid credentials", body: j({ error: "Invalid email or password" }) },
            ],
          },
          {
            id: "auth-me",
            method: "GET",
            path: "/api/v1/auth/me",
            title: "Current user",
            description: "Returns the authenticated user's profile and role.",
            auth: true,
            token: "any_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ id: 1, email: "admin@opendirector.com", role: "super_admin" }) },
            ],
          },
          {
            id: "auth-logout",
            method: "DELETE",
            path: "/api/v1/auth/logout",
            title: "Logout",
            description: "Invalidates the current bearer token.",
            auth: true,
            token: "any_jwt",
            responses: [{ status: 204, description: "Token invalidated", body: "" }],
          },
        ],
      },
      {
        id: "auth-identity",
        title: "Identity",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "auth-identity-get",
            method: "GET",
            path: "/api/v1/identity",
            title: "Get identity",
            description: "Returns the current user's full identity: role, org context, and `section_permissions` map. Called by FE on every page load.\n\nSection keys: `public_companies`, `directors`, `articles_management`, `pdf_intelligence`. System Owner access (users, admin_management, ai_management) is level-based only — not in `section_permissions`.",
            auth: true,
            token: "admin_jwt",
            responses: [
              {
                status: 200,
                description: "Success",
                body: j({
                  id: 1,
                  email: "admin@acme.com",
                  role: "admin",
                  org_id: 1,
                  section_permissions: {
                    public_companies: { all: true, sub_permissions: { company_data: { create_edit: true, delete: false } } },
                    directors: { all: true, sub_permissions: { director_shareholdings: { create_edit: true, delete: false } } },
                    articles_management: { all: false },
                    pdf_intelligence: { all: true },
                  },
                }),
              },
            ],
          },
        ],
      },
    ],
  },

  // ── Open Director (was Open REM) ───────────────────────────────────────────────
  {
    id: "open-director",
    title: "OpenDirector",
    label: "OpenDirector",
    description: "Remuneration reports, LTI opportunities, and benchmarking for the OpenDirector product.",
    badge: "OpenDirector",
    color: {
      badge: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800",
      dot: "bg-emerald-500",
      active: "text-emerald-700 dark:text-emerald-400",
    },
    groups: [
      {
        id: "od-remuneration",
        title: "Remuneration Reports",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "od-rem-report",
            method: "GET",
            path: "/api/v1/directors/:id/remuneration/report",
            title: "Get remuneration report",
            description: "Returns the full remuneration breakdown — fixed, variable, total — for a director in a given fiscal year.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "id",          in: "path",  type: "integer", required: true,  description: "Director ID", example: "42" },
              { name: "fiscal_year", in: "query", type: "integer", required: false, description: "Fiscal year (defaults to current)", example: "2026" },
              { name: "format",      in: "query", type: "string",  required: false, description: "Response format", enum: ["json", "pdf"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ director_id: 42, fiscal_year: 2026, currency: "AUD", fixed: { base_salary: 180000, superannuation: 19800 }, variable: { sti: 45000, lti: 60000 }, total: 304800 }) },
              { status: 403, description: "Requires remuneration permission", body: j({ error: "Remuneration section not enabled for this director" }) },
            ],
          },
        ],
      },
      {
        id: "od-lti",
        title: "Club LTI",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "od-lti-opportunities",
            method: "GET",
            path: "/api/v1/directors/:id/lti/opportunities",
            title: "List LTI opportunities",
            description: "Returns all LTI grant opportunities for a director, including vesting schedules and measurement periods.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "id",     in: "path",  type: "integer", required: true,  description: "Director ID", example: "42" },
              { name: "status", in: "query", type: "string",  required: false, description: "Filter by status", enum: ["active", "vested", "forfeited"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 7, grant_date: "2024-07-01", shares_granted: 50000, shares_vested: 12500, status: "active", current_value_aud: 95000 }] }) },
            ],
          },
          {
            id: "od-lti-rollup",
            method: "GET",
            path: "/api/v1/directors/:id/lti/rollup",
            title: "LTI roll-up",
            description: "Aggregated LTI totals — total granted, vested, and current market value across all opportunities.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Director ID", example: "42" }],
            responses: [
              { status: 200, description: "Success", body: j({ director_id: 42, total_shares_granted: 150000, total_shares_vested: 37500, total_current_value_aud: 285000, as_at: "2026-04-28" }) },
            ],
          },
        ],
      },
    ],
  },

  // ── MyOD / MyOpenDirector (was Open People) ───────────────────────────────────
  {
    id: "my-od",
    title: "MyOpenDirector",
    label: "MyOD",
    description: "Director portal — profiles, packages, organisations, and board composition for MyOpenDirector.",
    badge: "MyOD",
    color: {
      badge: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
      dot: "bg-blue-500",
      active: "text-blue-700 dark:text-blue-400",
    },
    groups: [
      {
        id: "my-od-organisations",
        title: "Organisations",
        basePrefix: "/api/v1/open_people",
        endpoints: [
          {
            id: "my-od-orgs-list",
            method: "GET",
            path: "/api/v1/open_people/organisations",
            title: "List organisations",
            description: "Returns all organisations visible to the authenticated user.",
            auth: true,
            token: "my_od_jwt",
            parameters: [
              { name: "page",   in: "query", type: "integer", required: false, description: "Page (default: 1)", example: "1" },
              { name: "per",    in: "query", type: "integer", required: false, description: "Per page, max 100 (default: 25)", example: "25" },
              { name: "search", in: "query", type: "string",  required: false, description: "Filter by name", example: "Acme" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 1, name: "Acme Corp", abn: "12 345 678 901", sector: "Financial Services", status: "active" }], meta: { total: 48, page: 1, per: 25 } }) },
            ],
          },
          {
            id: "my-od-orgs-filter-options",
            method: "GET",
            path: "/api/v1/open_people/organisations/filter_options",
            title: "Organisation filter options",
            description: "Returns filter option lists (sectors, statuses) for the organisation list view.",
            auth: true,
            token: "my_od_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ sectors: ["Financial Services", "Materials", "Healthcare"], statuses: ["active", "inactive"] }) },
            ],
          },
        ],
      },
      {
        id: "my-od-directors",
        title: "Directors",
        basePrefix: "/api/v1/open_people",
        endpoints: [
          {
            id: "my-od-directors-list",
            method: "GET",
            path: "/api/v1/organisations/:org_id/directors",
            title: "List directors",
            description: "Returns directors for an organisation, optionally filtered by package tier or status.",
            auth: true,
            token: "my_od_jwt",
            parameters: [
              { name: "org_id", in: "path",  type: "integer", required: true,  description: "Organisation ID", example: "1" },
              { name: "tier",   in: "query", type: "string",  required: false, description: "Filter by package", enum: ["free", "premium", "internal"] },
              { name: "status", in: "query", type: "string",  required: false, description: "Filter by status",  enum: ["active", "inactive"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 42, full_name: "Jane Smith", email: "jane@acme.com", tier: "premium", status: "active" }], meta: { total: 8 } }) },
            ],
          },
          {
            id: "my-od-directors-get",
            method: "GET",
            path: "/api/v1/directors/:id",
            title: "Get a director",
            description: "Returns the full director profile including demographics and section permissions.",
            auth: true,
            token: "my_od_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Director ID", example: "42" }],
            responses: [
              { status: 200, description: "Success", body: j({ id: 42, full_name: "Jane Smith", email: "jane@acme.com", tier: "premium", demographics: { date_of_birth: "1980-03-12", gender: "female" }, section_permissions: { remuneration: true, lti: true } }) },
            ],
          },
          {
            id: "my-od-directors-update",
            method: "PATCH",
            path: "/api/v1/directors/:id",
            title: "Update a director",
            description: "Partial update of personal details or demographics.",
            auth: true,
            token: "my_od_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Director ID", example: "42" }],
            requestBody: {
              description: "Any subset of director fields.",
              example: j({ full_name: "Jane A. Smith", demographics: { nationality: "New Zealander" } }),
            },
            responses: [
              { status: 200, description: "Updated", body: j({ id: 42, full_name: "Jane A. Smith", updated_at: "2026-04-28T10:00:00Z" }) },
              { status: 422, description: "Validation error", body: j({ errors: { email: ["has already been taken"] } }) },
            ],
          },
        ],
      },
      {
        id: "my-od-packages",
        title: "Packages",
        basePrefix: "/api/v1/open_people",
        endpoints: [
          {
            id: "my-od-packages-list",
            method: "GET",
            path: "/api/v1/packages",
            title: "List packages",
            description: "Returns all package tiers (Free / Premium / Internal) with their feature flags.",
            auth: true,
            token: "my_od_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: "free", label: "Free", features: ["profile"] }, { id: "premium", label: "Premium", features: ["profile", "remuneration", "lti"] }, { id: "internal", label: "Internal", features: ["all"] }] }) },
            ],
          },
          {
            id: "my-od-packages-assign",
            method: "PATCH",
            path: "/api/v1/directors/:id/package",
            title: "Assign package",
            description: "Upgrades or downgrades a director's package tier. Takes effect immediately.",
            auth: true,
            token: "my_od_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Director ID", example: "42" }],
            requestBody: { description: "Package tier to assign.", example: j({ tier: "premium" }) },
            responses: [
              { status: 200, description: "Updated", body: j({ id: 42, tier: "premium", updated_at: "2026-04-28T10:00:00Z" }) },
              { status: 422, description: "Invalid tier", body: j({ errors: { tier: ["must be one of: free, premium, internal"] } }) },
            ],
          },
        ],
      },
      {
        id: "my-od-users",
        title: "Users",
        basePrefix: "/api/v1/open_people",
        endpoints: [
          {
            id: "my-od-users-list",
            method: "GET",
            path: "/api/v1/users",
            title: "List users",
            description: "Returns portal users (HR, board secretaries). Not directors.",
            auth: true,
            token: "my_od_jwt",
            parameters: [
              { name: "role", in: "query", type: "string", required: false, description: "Filter by role", enum: ["super_admin", "system_admin", "admin"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 5, email: "hr@acme.com", role: "admin", org_id: 1 }], meta: { total: 3 } }) },
            ],
          },
        ],
      },
    ],
  },

  // ── Admin ─────────────────────────────────────────────────────────────────────
  {
    id: "admin",
    title: "Admin",
    label: "Admin",
    description: "Admin portal — user management, section permissions, public companies, director shareholdings, and articles.",
    badge: "Admin",
    color: {
      badge: "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 ring-violet-200 dark:ring-violet-800",
      dot: "bg-violet-500",
      active: "text-violet-700 dark:text-violet-400",
    },
    groups: [
      {
        id: "admin-admins",
        title: "Admins",
        basePrefix: "/api/v1/admin",
        endpoints: [
          {
            id: "admin-admins-list",
            method: "GET",
            path: "/api/v1/admin/admins",
            title: "List admins",
            description: "Returns all admin-level users. Accessible to super_admin / root only.",
            auth: true,
            token: "admin_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 1, email: "super@opendirector.com", level: "super_admin" }, { id: 2, email: "ops@opendirector.com", level: "system_admin" }] }) },
              { status: 403, description: "Forbidden", body: j({ error: "Forbidden" }) },
            ],
          },
          {
            id: "admin-admins-update",
            method: "PATCH",
            path: "/api/v1/admin/admins/:id",
            title: "Update admin",
            description: "Updates level or `section_permissions` for an admin user. System Owner fields are NOT in section_permissions — access is level-based only. Payload wraps fields under `admin: { ... }`.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Admin user ID", example: "2" }],
            requestBody: {
              description: "Wrap under `admin` key. `section_permissions` uses the full shape from the spec endpoint.",
              example: j({ admin: { section_permissions: { public_companies: { all: true, sub_permissions: { company_data: { create_edit: true, delete: false } } }, pdf_intelligence: { all: true } } } }),
            },
            responses: [
              { status: 200, description: "Updated", body: j({ id: 2, section_permissions: { pdf_intelligence: { all: true } } }) },
              { status: 403, description: "Cannot edit super_admin", body: j({ error: "Forbidden" }) },
            ],
          },
        ],
      },
      {
        id: "admin-section-perms",
        title: "Section Permissions",
        basePrefix: "/api/v1/admin",
        endpoints: [
          {
            id: "admin-perms-spec",
            method: "GET",
            path: "/api/v1/admin/admins/section_permission_spec",
            title: "Permission spec",
            description: "Returns the configurable section spec — used to build the Edit Admin UI. Section keys: `public_companies`, `directors`, `articles_management`, `pdf_intelligence`.\n\n- Section level: only `all` (boolean)\n- Sub level: `create_edit` and `delete` only\n- Visibility: user can see a section if `all === true` OR any sub has `create_edit` or `delete` true",
            auth: true,
            token: "admin_jwt",
            responses: [
              {
                status: 200,
                description: "Success",
                body: j({
                  data: [
                    { key: "public_companies",    label: "Public Companies",    section: "Data", sub_keys: ["company_data"] },
                    { key: "directors",           label: "Directors",           section: "Data", sub_keys: ["director_shareholdings"] },
                    { key: "articles_management", label: "Articles Management", section: "Data", sub_keys: [] },
                    { key: "pdf_intelligence",    label: "PDF Intelligence",    section: "AI",   sub_keys: [] },
                  ],
                  section_actions: ["all"],
                  sub_item_actions: ["create_edit", "delete"],
                  sub_item_labels: { company_data: "Company Data", director_shareholdings: "Director Shareholdings" },
                }),
              },
            ],
          },
        ],
      },
      {
        id: "admin-companies",
        title: "Public Companies",
        basePrefix: "/api/v1/admin",
        endpoints: [
          {
            id: "admin-companies-list",
            method: "GET",
            path: "/api/v1/admin/companies",
            title: "List companies",
            description: "Returns all public companies. Requires `public_companies` section permission.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "page",   in: "query", type: "integer", required: false, description: "Page", example: "1" },
              { name: "search", in: "query", type: "string",  required: false, description: "Search by name or ASX code", example: "BHP" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 10, name: "BHP Group", asx_code: "BHP", sector: "Materials", fiscal_year_end: "2024-06-30" }], meta: { total: 200, page: 1, per: 25 } }) },
            ],
          },
          {
            id: "admin-companies-get",
            method: "GET",
            path: "/api/v1/admin/companies/:company_id",
            title: "Get a company",
            description: "Returns full company details including fiscal year configuration.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "company_id", in: "path", type: "integer", required: true, description: "Company ID", example: "10" }],
            responses: [
              { status: 200, description: "Success", body: j({ id: 10, name: "BHP Group", asx_code: "BHP", fiscal_year_end: "2024-06-30", directors_count: 9 }) },
            ],
          },
          {
            id: "admin-companies-fiscal-years",
            method: "GET",
            path: "/api/v1/companies/:company_id/fiscal_years",
            title: "List fiscal years",
            description: "Returns available fiscal years for a company. Used by upload/report date pickers. Note: routes directly under `/api/v1/`, not under `/admin/`.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "company_id", in: "path", type: "integer", required: true, description: "Company ID", example: "10" }],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ year: 2024, label: "FY2024", fiscal_year_end: "2024-06-30" }, { year: 2023, label: "FY2023", fiscal_year_end: "2023-06-30" }] }) },
            ],
          },
          {
            id: "admin-companies-chatpdf-reports",
            method: "GET",
            path: "/api/v1/companies/:company_id/chatpdf_reports",
            title: "List ChatPDF reports",
            description: "Available PDF Intelligence reports for a company. Used when creating an upload from an existing report. Note: routes directly under `/api/v1/`, not under `/admin/`.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "company_id", in: "path", type: "integer", required: true, description: "Company ID", example: "10" }],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 5, year: 2024, month: 6, question_type: "rem", status: "completed" }] }) },
            ],
          },
        ],
      },
      {
        id: "admin-director-shares",
        title: "Director Shareholdings",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "admin-director-shares-create",
            method: "POST",
            path: "/api/v1/director_shares",
            title: "Create director share",
            description: "Creates a shareholding record (single or batch). Used from the Workspace verified answer flow. Requires `directors.director_shareholdings.create_edit`.",
            auth: true,
            token: "admin_jwt",
            requestBody: {
              description: "Share record. Can be a single object or array for batch.",
              example: j({ director_id: 42, company_id: 10, shares: 150000, as_at_date: "2026-04-28", source: "verified_answer" }),
            },
            responses: [
              { status: 201, description: "Created", body: j({ id: 88, director_id: 42, company_id: 10, shares: 150000, as_at_date: "2026-04-28" }) },
              { status: 422, description: "Validation error", body: j({ errors: { shares: ["must be greater than 0"] } }) },
            ],
          },
          {
            id: "admin-director-shares-update",
            method: "PATCH",
            path: "/api/v1/director_shares/:id",
            title: "Update director share",
            description: "Updates an existing shareholding record.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Share record ID", example: "88" }],
            requestBody: { description: "Fields to update.", example: j({ shares: 160000 }) },
            responses: [
              { status: 200, description: "Updated", body: j({ id: 88, shares: 160000, updated_at: "2026-04-28T10:00:00Z" }) },
            ],
          },
        ],
      },
      {
        id: "admin-articles",
        title: "Articles Management",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "admin-articles-list",
            method: "GET",
            path: "/api/v1/articles",
            title: "List articles",
            description: "Returns all managed articles/documents. Requires `articles_management.all`.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "page",   in: "query", type: "integer", required: false, description: "Page", example: "1" },
              { name: "status", in: "query", type: "string",  required: false, description: "Filter", enum: ["draft", "published", "archived"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 1, title: "Board Charter 2026", status: "published", updated_at: "2026-03-01T00:00:00Z" }], meta: { total: 12 } }) },
            ],
          },
        ],
      },
      // ── PDF Intelligence (under Admin) ────────────────────────────────────────
      {
        id: "pdf-uploads",
        title: "PDF Uploads",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "pdf-uploads-list",
            method: "GET",
            path: "/api/v1/pdf_uploads",
            title: "List uploads",
            description: "Returns all PDF uploads. Each item includes `fiscal_year_end` (YYYY-MM-DD) when the upload has a `company_id` with a configured FY — FE uses this for workspace date display instead of `upload_date`.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "page",          in: "query", type: "integer", required: false, description: "Page", example: "1" },
              { name: "per_page",      in: "query", type: "integer", required: false, description: "Per page", example: "25" },
              { name: "status",        in: "query", type: "string",  required: false, description: "Processing status", enum: ["pending", "processing", "completed", "failed"] },
              { name: "question_type", in: "query", type: "string",  required: false, description: "rem or agm", enum: ["rem", "agm"] },
              { name: "company_name",  in: "query", type: "string",  required: false, description: "Filter by company name", example: "BHP" },
              { name: "uploaded_by",   in: "query", type: "string",  required: false, description: "Filter by uploader email" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 1, company_id: 10, company_name: "BHP Group", question_type: "rem", year: 2024, month: 6, status: "completed", fiscal_year_end: "2024-06-30", uploaded_at: "2026-03-01T00:00:00Z" }], meta: { total: 45 } }) },
            ],
          },
          {
            id: "pdf-uploads-get",
            method: "GET",
            path: "/api/v1/pdf_uploads/:id",
            title: "Get an upload",
            description: "Returns a single upload with its questions and answers. Includes `fiscal_year_end` used by the workspace header (e.g. \"Jun 2024\").",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Upload ID", example: "1" }],
            responses: [
              { status: 200, description: "Success", body: j({ id: 1, company_id: 10, question_type: "rem", status: "completed", fiscal_year_end: "2024-06-30", questions: [{ id: 3, text: "What is CEO fixed pay?", answer_id: 55 }] }) },
            ],
          },
          {
            id: "pdf-uploads-create",
            method: "POST",
            path: "/api/v1/chatpdf",
            title: "Submit a PDF",
            description: "Uploads a PDF for async question extraction. Multipart form data. Pass either `question_text` (free-text) or `use_saved_question: true` + `question_ids[]`.",
            auth: true,
            token: "admin_jwt",
            requestBody: {
              description: "Multipart form. `file` is required.",
              example: `FormData {\n  file: <PDF binary>,\n  company_name: "BHP Group",\n  company_id: 10,          // optional\n  question_type: "rem",\n  year: 2024,\n  month: 6,\n  use_saved_question: true,\n  question_ids[]: [1, 2, 3],\n  checked_by: "admin@acme.com" // optional\n}`,
            },
            responses: [
              { status: 201, description: "Processing started", body: j({ id: 2, status: "processing", company_name: "BHP Group", question_type: "rem" }) },
              { status: 422, description: "Validation error", body: j({ errors: { file: ["must be a PDF"] } }) },
            ],
          },
          {
            id: "pdf-uploads-ask",
            method: "POST",
            path: "/api/v1/pdf_uploads/:id/ask",
            title: "Ask question(s)",
            description: "Sends additional question(s) to an already-uploaded PDF. Pass `question_text` for free-text or `use_saved_question: true` + `question_ids[]`.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Upload ID", example: "1" }],
            requestBody: {
              description: "Either free-text or saved question IDs.",
              example: j({ question_text: "What is the CFO base salary?", use_saved_question: false }),
            },
            responses: [{ status: 201, description: "Question submitted", body: j({ answer_id: 56, status: "processing" }) }],
          },
          {
            id: "pdf-uploads-extract",
            method: "POST",
            path: "/api/v1/pdf_uploads/:id/extract",
            title: "Extract from upload",
            description: "Runs an extraction (e.g. director-share data) on an upload. Used from the Workspace view.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Upload ID", example: "1" }],
            requestBody: {
              description: "`category` required. `user_prompt` optional.",
              example: j({ category: "director_share", user_prompt: "Extract all director shareholdings" }),
            },
            responses: [{ status: 202, description: "Extraction started", body: j({ job_id: "ext_abc123", status: "processing" }) }],
          },
          {
            id: "pdf-uploads-retry",
            method: "POST",
            path: "/api/v1/pdf_uploads/:id/retry",
            title: "Retry upload",
            description: "Retries processing on a failed upload.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Upload ID", example: "1" }],
            responses: [{ status: 200, description: "Retrying", body: j({ id: 1, status: "processing" }) }],
          },
          {
            id: "pdf-uploads-delete",
            method: "DELETE",
            path: "/api/v1/pdf_uploads/:id",
            title: "Delete upload",
            description: "Permanently deletes an upload and all associated answers.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Upload ID", example: "1" }],
            responses: [{ status: 204, description: "Deleted", body: "" }],
          },
          {
            id: "pdf-chatpdf-from-report",
            method: "POST",
            path: "/api/v1/chatpdf/from_report",
            title: "Create from report",
            description: "Creates a new PDF upload using an existing report as source.",
            auth: true,
            token: "admin_jwt",
            requestBody: { description: "Source report reference.", example: j({ report_id: 5, question_type: "rem" }) },
            responses: [{ status: 201, description: "Created", body: j({ id: 3, status: "processing", source: "from_report" }) }],
          },
        ],
      },
      {
        id: "pdf-answers",
        title: "PDF Answers",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "pdf-answers-list",
            method: "GET",
            path: "/api/v1/pdf_answers",
            title: "List answers",
            description: "Returns PDF answers. When filtered by `company_id`, `meta.fiscal_year_end` is included.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "company_id",    in: "query", type: "integer", required: false, description: "Filter by company — adds meta.fiscal_year_end", example: "10" },
              { name: "upload_id",     in: "query", type: "integer", required: false, description: "Filter by upload", example: "1" },
              { name: "submit_status", in: "query", type: "string",  required: false, description: "Filter by status", enum: ["draft", "saved_to_db", "done"] },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 55, upload_id: 1, question_id: 3, verified_answer: "CEO fixed pay: $1.2M", submit_status: "draft" }], meta: { total: 10, fiscal_year_end: "2024-06-30" } }) },
            ],
          },
          {
            id: "pdf-answers-get",
            method: "GET",
            path: "/api/v1/pdf_answers/:id",
            title: "Get an answer",
            description: "Returns a single answer. `data.fiscal_year_end` is included when the answer has a `company_id`. Used by `AnswerCardStatutoryRem` to build `rem_date`.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "id",                in: "path",  type: "integer", required: true,  description: "Answer ID", example: "55" },
              { name: "include_audit_logs", in: "query", type: "boolean", required: false, description: "Include audit log history" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ id: 55, upload_id: 1, question_id: 3, raw_answer: "CEO base salary is $1,200,000", verified_answer: null, submit_status: "draft", fiscal_year_end: "2024-06-30" }) },
            ],
          },
          {
            id: "pdf-answers-update",
            method: "PATCH",
            path: "/api/v1/pdf_answers/:id",
            title: "Update an answer",
            description: "Updates verified_answer, submit_status, or marks as done. Used by reviewers in the Workspace.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Answer ID", example: "55" }],
            requestBody: {
              description: "Fields to update.",
              example: j({ verified_answer: "CEO fixed pay: $1,200,000", submit_status: "saved_to_db", mark_as_done: true }),
            },
            responses: [
              { status: 200, description: "Updated", body: j({ id: 55, verified_answer: "CEO fixed pay: $1,200,000", submit_status: "saved_to_db" }) },
            ],
          },
          {
            id: "pdf-answers-submit",
            method: "POST",
            path: "/api/v1/pdf_answers/:id/submit_to_database",
            title: "Submit to database",
            description: "Submits verified answer data to the permanent database.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Answer ID", example: "55" }],
            responses: [{ status: 200, description: "Submitted", body: j({ id: 55, submit_status: "saved_to_db", submitted_at: "2026-04-28T10:00:00Z" }) }],
          },
          {
            id: "pdf-answers-delete",
            method: "DELETE",
            path: "/api/v1/pdf_answers/:id",
            title: "Delete an answer",
            description: "Deletes an answer/report row.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Answer ID", example: "55" }],
            responses: [{ status: 204, description: "Deleted", body: "" }],
          },
        ],
      },
      {
        id: "pdf-results",
        title: "Results",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "pdf-results-list",
            method: "GET",
            path: "/api/v1/chatpdf_works",
            title: "List result companies",
            description: "Returns companies that have processed PDF Intelligence results.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "page",   in: "query", type: "integer", required: false, description: "Page", example: "1" },
              { name: "search", in: "query", type: "string",  required: false, description: "Filter by company name" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ company_id: 10, company_name: "BHP Group", reports_count: 4, last_processed_at: "2026-04-01T00:00:00Z" }] }) },
            ],
          },
          {
            id: "pdf-results-get",
            method: "GET",
            path: "/api/v1/chatpdf_works/:company_id",
            title: "Get company results",
            description: "Returns a company with paginated extracted reports.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "company_id",          in: "path",  type: "integer", required: true,  description: "Company ID", example: "10" },
              { name: "page",                in: "query", type: "integer", required: false, description: "Page" },
              { name: "per_page",            in: "query", type: "integer", required: false, description: "Per page" },
              { name: "extraction_category", in: "query", type: "string",  required: false, description: "Filter by extraction type", example: "director_share" },
              { name: "include_reports",     in: "query", type: "boolean", required: false, description: "Include full report data" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ company_id: 10, company_name: "BHP Group", reports: [{ id: 5, year: 2024, month: 6, extraction_category: "rem", status: "completed" }] }) },
            ],
          },
        ],
      },
      {
        id: "pdf-questions",
        title: "Questions",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "pdf-questions-list",
            method: "GET",
            path: "/api/v1/questions",
            title: "List questions",
            description: "Returns all saved extraction questions.",
            auth: true,
            token: "admin_jwt",
            parameters: [
              { name: "question_type", in: "query", type: "string",  required: false, description: "rem or agm", enum: ["rem", "agm"] },
              { name: "active_only",   in: "query", type: "boolean", required: false, description: "Only active questions" },
            ],
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: 1, text: "What is CEO base salary?", question_type: "rem", active: true, position: 1 }] }) },
            ],
          },
          {
            id: "pdf-questions-sort",
            method: "GET",
            path: "/api/v1/questions/sort",
            title: "Sort order",
            description: "Returns the display sort order for rem/agm active questions.",
            auth: true,
            token: "admin_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ rem: [{ id: 1, position: 1 }, { id: 2, position: 2 }], agm: [{ id: 3, position: 1 }] }) },
            ],
          },
          {
            id: "pdf-questions-create",
            method: "POST",
            path: "/api/v1/questions",
            title: "Create question",
            description: "Creates a new extraction question.",
            auth: true,
            token: "admin_jwt",
            requestBody: { description: "Question fields.", example: j({ text: "What is the CFO base salary?", question_type: "rem", active: true }) },
            responses: [{ status: 201, description: "Created", body: j({ id: 4, text: "What is the CFO base salary?", question_type: "rem", active: true, position: 3 }) }],
          },
          {
            id: "pdf-questions-update",
            method: "PATCH",
            path: "/api/v1/questions/:id",
            title: "Update question",
            description: "Updates a question's text, type, or active status.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Question ID", example: "4" }],
            requestBody: { description: "Fields to update.", example: j({ active: false }) },
            responses: [{ status: 200, description: "Updated", body: j({ id: 4, active: false }) }],
          },
          {
            id: "pdf-questions-reorder",
            method: "POST",
            path: "/api/v1/questions/update_positions",
            title: "Reorder questions",
            description: "Updates display order for rem and agm questions.",
            auth: true,
            token: "admin_jwt",
            requestBody: { description: "Position map per type.", example: j({ questions: { rem: { 1: 2, 2: 1 }, agm: { 3: 1 } } }) },
            responses: [{ status: 200, description: "Updated", body: j({ updated: true }) }],
          },
          {
            id: "pdf-questions-delete",
            method: "DELETE",
            path: "/api/v1/questions/:id",
            title: "Delete question",
            description: "Permanently deletes a question.",
            auth: true,
            token: "admin_jwt",
            parameters: [{ name: "id", in: "path", type: "integer", required: true, description: "Question ID", example: "4" }],
            responses: [{ status: 204, description: "Deleted", body: "" }],
          },
        ],
      },
      {
        id: "pdf-misc",
        title: "Utilities",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "pdf-extract-types",
            method: "GET",
            path: "/api/v1/extract_types",
            title: "List extract types",
            description: "Returns available extraction categories for the extraction dropdown.",
            auth: true,
            token: "admin_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ key: "director_share", label: "Director Shareholdings" }, { key: "rem", label: "Remuneration" }] }) },
            ],
          },
        ],
      },
    ],
  },

  // ── Shared ────────────────────────────────────────────────────────────────────
  {
    id: "shared",
    title: "Shared",
    label: "Shared",
    description: "APIs available across all products — webhooks and health check.",
    badge: "Shared",
    color: {
      badge: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
      dot: "bg-amber-500",
      active: "text-amber-700 dark:text-amber-400",
    },
    groups: [
      {
        id: "shared-webhooks",
        title: "Webhooks",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "shared-webhooks-list",
            method: "GET",
            path: "/api/v1/webhooks",
            title: "List webhooks",
            description: "Returns all registered webhook endpoints for your account.",
            auth: true,
            token: "any_jwt",
            responses: [
              { status: 200, description: "Success", body: j({ data: [{ id: "wh_001", url: "https://yourapp.com/hooks/od", events: ["director.updated"], active: true }] }) },
            ],
          },
          {
            id: "shared-webhooks-create",
            method: "POST",
            path: "/api/v1/webhooks",
            title: "Create a webhook",
            description: "Register a URL to receive POST events when directors, packages, or deployments change.",
            auth: true,
            token: "any_jwt",
            requestBody: {
              description: "Webhook configuration.",
              example: j({ url: "https://yourapp.com/hooks/od", events: ["director.updated", "package.changed"], secret: "your_signing_secret" }),
            },
            responses: [
              { status: 201, description: "Created", body: j({ id: "wh_002", url: "https://yourapp.com/hooks/od", active: true }) },
            ],
          },
        ],
      },
      {
        id: "shared-health",
        title: "Health",
        basePrefix: "/api/v1",
        endpoints: [
          {
            id: "shared-health-check",
            method: "GET",
            path: "/api/v1/health",
            title: "Health check",
            description: "API server status. No authentication required. Use for uptime monitoring.",
            auth: false,
            token: "none",
            responses: [
              { status: 200, description: "Healthy",  body: j({ status: "ok",       version: "1.3.0", db: "connected", cache: "connected" }) },
              { status: 503, description: "Degraded", body: j({ status: "degraded", db: "connected", cache: "error" }) },
            ],
          },
        ],
      },
    ],
  },
];
