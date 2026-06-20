export const API_URL =
  import.meta.env.VITE_API_URL ??
  (window.location.hostname.endsWith(".onrender.com")
    ? "https://survey-backend-yhiz.onrender.com"
    : "http://localhost:4000");

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  health: () => request("/api/health"),
  attributes: () => request("/api/attributes"),
  listSites: () => request("/api/sites"),
  getSite: (id) => request(`/api/sites/${id}`),
  createSite: (payload) => request("/api/sites", { method: "POST", body: JSON.stringify(payload) }),
  getAssessments: (siteId) => request(`/api/sites/${siteId}/assessments`),
  saveAssessments: (siteId, ratings) =>
    request(`/api/sites/${siteId}/assessments`, { method: "PUT", body: JSON.stringify({ ratings }) }),

  getAudit: (siteId) => request(`/api/sites/${siteId}/audit`),
  saveAudit: (siteId, results) => request(`/api/sites/${siteId}/audit`, { method: "PUT", body: JSON.stringify({ results }) }),

  listObservations: (siteId) => request(`/api/sites/${siteId}/observations`),
  createObservation: (siteId, payload) =>
    request(`/api/sites/${siteId}/observations`, { method: "POST", body: JSON.stringify(payload) }),
  deleteObservation: (siteId, observationId) =>
    request(`/api/sites/${siteId}/observations/${observationId}`, { method: "DELETE" }),

  listPersonas: (siteId) => request(`/api/sites/${siteId}/personas`),
  createPersona: (siteId, payload) => request(`/api/sites/${siteId}/personas`, { method: "POST", body: JSON.stringify(payload) }),
  deletePersona: (siteId, personaId) => request(`/api/sites/${siteId}/personas/${personaId}`, { method: "DELETE" }),

  getInterventions: (siteId) => request(`/api/sites/${siteId}/interventions`),
  updateIntervention: (siteId, attributeCode, payload) =>
    request(`/api/sites/${siteId}/interventions/${attributeCode}`, { method: "PUT", body: JSON.stringify(payload) }),

  getReportCard: (siteId) => request(`/api/sites/${siteId}/report-card`)
};
