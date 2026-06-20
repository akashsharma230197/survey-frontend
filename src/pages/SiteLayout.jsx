import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { api } from "../api.js";

const TABS = [
  { to: "assessment", label: "Module 2 · UXQI" },
  { to: "audit", label: "Module 3 · Audit" },
  { to: "observations", label: "Module 4 · Behaviour" },
  { to: "personas", label: "Module 6 · Personas" },
  { to: "interventions", label: "Module 7 · Priorities" },
  { to: "report-card", label: "Module 8 · Report Card" }
];

function SiteLayout() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .getSite(siteId)
      .then((data) => isMounted && setSite(data))
      .catch((requestError) => isMounted && setError(requestError.message));
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  return (
    <section className="workspace">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> All sites
      </Link>

      {error ? <p className="error-message">{error}</p> : null}

      {site ? (
        <div className="toolbar">
          <div>
            <p className="eyebrow">UXF-IUPS Assessment Toolkit</p>
            <h1>{site.name}</h1>
            <p className="muted">
              {site.typology ? `${site.typology} · ` : ""}
              {site.location || "No location set"}
            </p>
          </div>
        </div>
      ) : (
        <p className="status-row">
          <Loader2 className="spin" size={16} /> Loading site
        </p>
      )}

      <nav className="tab-nav">
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? "tab-link active" : "tab-link")}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ site }} />
    </section>
  );
}

export default SiteLayout;
