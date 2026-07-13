export type EnrichmentData = {
  company: string | null;
  industry: string | null;
  employeeCount: string | null;
  location: string | null;
};

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "live.com",
];

function extractDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;

  const domain = parts[1].toLowerCase().trim();
  if (!domain || FREE_EMAIL_DOMAINS.includes(domain)) return null;

  return domain;
}

export async function enrichLead(
  email: string,
): Promise<EnrichmentData | null> {
  const domain = extractDomain(email);
  if (!domain) return null;

  const rawKey = process.env.APOLLO_API_KEY ?? "";
  // Strip BOM (U+FEFF, char 65279) that Windows/PowerShell injects into env vars
  const apiKey = (rawKey.charCodeAt(0) === 0xfeff ? rawKey.slice(1) : rawKey).trim();
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.apollo.io/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Api-Key": apiKey,
        },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    const org = json.organization;

    if (!org || !org.name) return null;

    const location = [org.city, org.state, org.country]
      .filter(Boolean)
      .join(", ");

    return {
      company: org.name || null,
      industry: org.industry || null,
      employeeCount: org.estimated_num_employees
        ? String(org.estimated_num_employees)
        : null,
      location: location || null,
    };
  } catch (err) {
    console.error("Apollo enrichment error:", err);
    return null;
  }
}
