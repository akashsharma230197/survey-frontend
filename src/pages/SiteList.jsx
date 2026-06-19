import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Loader2, MapPin, Plus, RefreshCw } from "lucide-react";
import { api } from "../api.js";

function SiteList() {
  const [sites, setSites] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadSites() {
    setStatus("loading");
    setError("");
    try {
      setSites(await api.listSites());
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  return (
    <section className="workspace">
      <div className="toolbar">
        <div>
          <p className="eyebrow">UXF-IUPS Assessment Toolkit</p>
          <h1>Urban public space sites</h1>
        </div>
        <div className="toolbar-actions">
          <button className="icon-button" type="button" onClick={loadSites} title="Refresh sites">
            <RefreshCw size={18} />
          </button>
          <Link className="primary-button" to="/sites/new">
            <Plus size={17} />
            New site
          </Link>
        </div>
      </div>

      {status === "loading" ? (
        <p className="status-row">
          <Loader2 className="spin" size={16} /> Loading sites
        </p>
      ) : null}
      {error ? <p className="error-message">{error}</p> : null}

      {status === "ready" && sites.length === 0 ? (
        <p className="empty-state">No sites yet. Add the first site profile to begin a UXQI assessment.</p>
      ) : null}

      <section className="survey-list" aria-label="Sites">
        {sites.map((site) => (
          <Link className="survey-card site-card" key={site.id} to={`/sites/${site.id}`}>
            <ClipboardList size={20} />
            <div>
              <h2>{site.name}</h2>
              <p className="muted">
                {site.typology ? `${site.typology} · ` : ""}
                <MapPin size={14} /> {site.location || "No location set"}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}

export default SiteList;
