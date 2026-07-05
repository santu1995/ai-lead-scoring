export type NormalizedLead = {
  name: string;
  email: string;
  company: string;
  role: string;
  budget: string;
  timeline: string;
  message: string;
};

export function normalizeWebsiteLead(body: any): NormalizedLead {
  return {
    name: body.name || "Unknown",
    email: body.email || "",
    company: body.company || "Not specified",
    role: body.role || "Not specified",
    budget: body.budget || "Not specified",
    timeline: body.timeline || "Not specified",
    message: body.message || "",
  };
}

export function normalizeFacebookLead(body: any): NormalizedLead {
  return {
    name: body.full_name || body.name || "Unknown",
    email: body.email || "",
    company: body.company_name || body.company || "Not specified",
    role: body.job_title || body.role || "Not specified",
    budget: body.budget || "Not specified",
    timeline: body.timeline || "Not specified",
    message: body.ad_name
      ? `Inquiry from ad: ${body.ad_name}`
      : "Facebook Ad lead inquiry",
  };
}

export function normalizeGoogleFormLead(body: any): NormalizedLead {
  return {
    name: body["Full Name"] || body.name || "Unknown",
    email: body["Email Address"] || body.email || "",
    company: body["Company"] || body.company || "Not specified",
    role: body["Role"] || body.role || "Not specified",
    budget: body["Budget"] || body.budget || "Not specified",
    timeline: body["Timeline"] || body.timeline || "Not specified",
    message:
      body["Message"] ||
      body["What do you need help with?"] ||
      "Google Form submission",
  };
}
