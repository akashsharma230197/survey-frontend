import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "../api.js";

function ReportCard() {
  const { siteId } = useParams();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    api
      .getReportCard(siteId)
      .then((data) => {
        if (!isMounted) return;
        setReport(data);
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

  if (status === "loading") {
    return (
      <p className="status-row">
        <Loader2 className="spin" size={16} /> Loading report card
      </p>
    );
  }

  return (
    <div>
      <p className="eyebrow">Module 8 · Urban Public Space Report Card</p>
      {error ? <p className="error-message">{error}</p> : null}

      {report ? (
        <>
          {!report.isComplete ? (
            <p className="error-message">
              Not all 38 attributes are rated yet — this score only reflects the dimensions and attributes rated so far.
            </p>
          ) : null}

          <div className="report-card-overall">
            <div className="report-card-score">{report.overall !== null ? report.overall.toFixed(1) : "-"}</div>
            <div>
              <p className="report-card-grade">Grade {report.grade ?? "-"}</p>
              <p className="muted">{report.status ?? "No ratings yet"}</p>
            </div>
          </div>

          <table className="attribute-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Weight</th>
                <th>Rated</th>
                <th>Score (0-100)</th>
                <th>Weighted score</th>
              </tr>
            </thead>
            <tbody>
              {report.dimensions.map((dimension) => (
                <tr key={dimension.code}>
                  <td>
                    {dimension.code} · {dimension.name}
                  </td>
                  <td>{dimension.weight}%</td>
                  <td>
                    {dimension.ratedCount}/{dimension.totalCount}
                  </td>
                  <td>{dimension.score !== null ? dimension.score.toFixed(1) : "-"}</td>
                  <td>{dimension.weightedScore !== null ? dimension.weightedScore.toFixed(1) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}

export default ReportCard;
