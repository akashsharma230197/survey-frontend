import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { api } from "../api.js";

const STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "partial", label: "Partial" },
  { value: "absent", label: "Absent" }
];

function AuditTool() {
  const { siteId } = useParams();
  const [criteria, setCriteria] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .getAudit(siteId)
      .then((data) => {
        if (!isMounted) return;
        setCriteria(data.criteria);
        setSummary(data.summary);
        setStatuses(
          Object.fromEntries(data.criteria.filter((criterion) => criterion.status).map((criterion) => [criterion.id, criterion.status]))
        );
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!isMounted) return;
        setError(requestError.message);
        setStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  const groupedCriteria = useMemo(() => {
    const groups = new Map();
    for (const criterion of criteria) {
      if (!groups.has(criterion.section)) groups.set(criterion.section, []);
      groups.get(criterion.section).push(criterion);
    }
    return groups;
  }, [criteria]);

  async function save() {
    setStatus("saving");
    setError("");
    const results = Object.entries(statuses).map(([criterionId, value]) => ({ criterionId, status: value }));
    try {
      const result = await api.saveAudit(siteId, results);
      setCriteria(result.criteria);
      setSummary(result.summary);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <p className="status-row">
        <Loader2 className="spin" size={16} /> Loading audit
      </p>
    );
  }

  return (
    <div>
      <div className="toolbar">
        <p className="eyebrow">Module 3 · Physical Audit (62 criteria)</p>
        <button className="primary-button" type="button" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? <Loader2 className="spin" size={16} /> : <Save size={17} />}
          Save audit
        </button>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      {summary ? (
        <div className="summary-panel">
          <p className="muted">
            {summary.ratedCount} of {summary.totalCount} criteria rated
          </p>
          <p className="accessibility-score">
            Accessibility score: {summary.accessibilityScore !== null ? `${summary.accessibilityScore.toFixed(1)}%` : "Not yet rated"}
          </p>
          <div className="dimension-summary-grid">
            {summary.sections.map((section) => (
              <div className="dimension-summary-card" key={section.code}>
                <h3>
                  {section.code} ({section.totalCount})
                </h3>
                <p className="muted">{section.domain}</p>
                <p>
                  {section.ratedCount}/{section.totalCount} rated
                </p>
                {section.score !== null ? <p>Score: {section.score.toFixed(0)}%</p> : <p className="muted">No ratings yet</p>}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {Array.from(groupedCriteria.entries()).map(([sectionCode, sectionCriteria]) => (
        <div className="dimension-block" key={sectionCode}>
          <h2>
            {sectionCode} · {summary?.sections.find((section) => section.code === sectionCode)?.domain}
          </h2>
          <table className="attribute-table">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sectionCriteria.map((criterion) => (
                <tr key={criterion.id}>
                  <td>
                    <span className="attribute-code">{criterion.id}</span> {criterion.description}
                  </td>
                  <td>
                    <select
                      value={statuses[criterion.id] ?? ""}
                      onChange={(event) =>
                        setStatuses((current) => ({ ...current, [criterion.id]: event.target.value }))
                      }
                    >
                      <option value="">-</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default AuditTool;
