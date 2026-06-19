import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { api } from "../api.js";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function SiteAssessment() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [ratings, setRatings] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setStatus("loading");
      setError("");
      try {
        const [siteData, assessmentData] = await Promise.all([api.getSite(siteId), api.getAssessments(siteId)]);
        if (!isMounted) return;
        setSite(siteData);
        setAttributes(assessmentData.attributes);
        setSummary(assessmentData.summary);
        setRatings(
          Object.fromEntries(
            assessmentData.attributes
              .filter((attribute) => attribute.importance !== null)
              .map((attribute) => [attribute.code, { importance: attribute.importance, performance: attribute.performance }])
          )
        );
        setStatus("ready");
      } catch (requestError) {
        if (!isMounted) return;
        setError(requestError.message);
        setStatus("error");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  const groupedAttributes = useMemo(() => {
    const groups = new Map();
    for (const attribute of attributes) {
      if (!groups.has(attribute.dimension)) groups.set(attribute.dimension, []);
      groups.get(attribute.dimension).push(attribute);
    }
    return groups;
  }, [attributes]);

  function setRating(code, field, value) {
    setRatings((current) => ({
      ...current,
      [code]: { ...current[code], [field]: value ? Number(value) : undefined }
    }));
  }

  async function save() {
    setStatus("saving");
    setError("");
    const payload = Object.entries(ratings)
      .filter(([, value]) => value.importance && value.performance)
      .map(([attributeCode, value]) => ({ attributeCode, importance: value.importance, performance: value.performance }));

    try {
      const result = await api.saveAssessments(siteId, payload);
      setAttributes(result.attributes);
      setSummary(result.summary);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <section className="workspace">
        <p className="status-row">
          <Loader2 className="spin" size={16} /> Loading site
        </p>
      </section>
    );
  }

  return (
    <section className="workspace">
      <div className="toolbar">
        <div>
          <Link className="back-link" to="/">
            <ArrowLeft size={16} /> All sites
          </Link>
          <p className="eyebrow">Module 2 · UXQI Assessment (38 attributes)</p>
          <h1>{site?.name}</h1>
          <p className="muted">
            {site?.typology ? `${site.typology} · ` : ""}
            {site?.location || "No location set"}
          </p>
        </div>
        <button className="primary-button" type="button" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? <Loader2 className="spin" size={16} /> : <Save size={17} />}
          Save ratings
        </button>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {summary ? <SummaryPanel summary={summary} /> : null}

      {Array.from(groupedAttributes.entries()).map(([dimensionCode, dimensionAttributes]) => (
        <div className="dimension-block" key={dimensionCode}>
          <h2>
            {dimensionCode} · {summary?.dimensions.find((dimension) => dimension.code === dimensionCode)?.name}
          </h2>
          <table className="attribute-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Importance</th>
                <th>Performance</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {dimensionAttributes.map((attribute) => {
                const rating = ratings[attribute.code] ?? {};
                const gap =
                  rating.importance && rating.performance ? rating.importance - rating.performance : null;
                return (
                  <tr key={attribute.code}>
                    <td>
                      <span className="attribute-code">{attribute.code}</span> {attribute.name}
                    </td>
                    <td>
                      <select value={rating.importance ?? ""} onChange={(event) => setRating(attribute.code, "importance", event.target.value)}>
                        <option value="">-</option>
                        {RATING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={rating.performance ?? ""} onChange={(event) => setRating(attribute.code, "performance", event.target.value)}>
                        <option value="">-</option>
                        {RATING_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={gap !== null && gap >= 1.5 ? "gap-high" : ""}>{gap ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

function SummaryPanel({ summary }) {
  const topPriorities = summary.priorityActions.filter((action) => action.priority.level !== "Maintain").slice(0, 5);

  return (
    <div className="summary-panel">
      <p className="muted">
        {summary.ratedCount} of {summary.totalCount} attributes rated
      </p>
      <div className="dimension-summary-grid">
        {summary.dimensions.map((dimension) => (
          <div className="dimension-summary-card" key={dimension.code}>
            <h3>
              {dimension.code} ({dimension.weight}%)
            </h3>
            <p className="muted">{dimension.name}</p>
            <p>
              {dimension.ratedCount}/{dimension.totalCount} rated
            </p>
            {dimension.avgGap !== null ? <p>Avg gap: {dimension.avgGap.toFixed(2)}</p> : <p className="muted">No ratings yet</p>}
          </div>
        ))}
      </div>
      {topPriorities.length > 0 ? (
        <div className="priority-list">
          <h3>Highest-gap attributes</h3>
          <ul>
            {topPriorities.map((action) => (
              <li key={action.code}>
                <strong>{action.name}</strong> — gap {action.gap.toFixed(1)} ({action.priority.level}, {action.priority.timeline})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default SiteAssessment;
