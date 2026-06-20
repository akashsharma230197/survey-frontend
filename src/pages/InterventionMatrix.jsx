import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../api.js";

const STATUS_OPTIONS = ["Pending", "In Progress", "Done"];

function InterventionMatrix() {
  const { siteId } = useParams();
  const [matrix, setMatrix] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    api
      .getInterventions(siteId)
      .then((data) => {
        setMatrix(data);
        setStatus("ready");
      })
      .catch((requestError) => {
        setError(requestError.message);
        setStatus("error");
      });
  }

  useEffect(load, [siteId]);

  async function updateRow(attributeCode, patch) {
    const row = matrix.find((entry) => entry.attributeCode === attributeCode);
    try {
      const result = await api.updateIntervention(siteId, attributeCode, {
        responsibleAgency: row.responsibleAgency,
        status: row.status,
        ...patch
      });
      setMatrix(result);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (status === "loading") {
    return (
      <p className="status-row">
        <Loader2 className="spin" size={16} /> Loading priority matrix
      </p>
    );
  }

  return (
    <div>
      <p className="eyebrow">Module 7 · Priority Intervention Matrix</p>
      {error ? <p className="error-message">{error}</p> : null}

      {matrix.length === 0 ? (
        <p className="empty-state">No rated attributes yet. Rate attributes in Module 2 to populate this matrix.</p>
      ) : (
        <table className="attribute-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Gap</th>
              <th>Priority</th>
              <th>Timeline</th>
              <th>Responsible agency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.attributeCode}>
                <td>
                  <span className="attribute-code">{row.attributeCode}</span> {row.attributeName}
                </td>
                <td className={row.gap >= 1.5 ? "gap-high" : ""}>{row.gap}</td>
                <td>{row.priority.level}</td>
                <td>{row.priority.timeline}</td>
                <td>
                  <input
                    defaultValue={row.responsibleAgency ?? ""}
                    onBlur={(event) => updateRow(row.attributeCode, { responsibleAgency: event.target.value })}
                    placeholder="e.g. NDMC Works Dept"
                  />
                </td>
                <td>
                  <select value={row.status} onChange={(event) => updateRow(row.attributeCode, { status: event.target.value })}>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default InterventionMatrix;
