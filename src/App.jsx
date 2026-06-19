import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, RefreshCw, Send } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL ??
  (window.location.hostname.endsWith(".onrender.com")
    ? "https://survey-backend-yhiz.onrender.com"
    : "http://localhost:4000");

function App() {
  const [health, setHealth] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => form.title.trim().length > 0, [form.title]);

  async function loadData() {
    setStatus("loading");
    setError("");

    try {
      const [healthResponse, surveysResponse] = await Promise.all([
        fetch(`${API_URL}/api/health`),
        fetch(`${API_URL}/api/surveys`)
      ]);

      if (!healthResponse.ok || !surveysResponse.ok) {
        throw new Error("Backend request failed");
      }

      setHealth(await healthResponse.json());
      setSurveys(await surveysResponse.json());
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  async function createSurvey(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("saving");
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Could not create survey");
      }

      const survey = await response.json();
      setSurveys((currentSurveys) => [survey, ...currentSurveys]);
      setForm({ title: "", description: "" });
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Survey Studio</p>
            <h1>Build and track survey drafts</h1>
          </div>
          <button className="icon-button" type="button" onClick={loadData} title="Refresh surveys">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="status-row">
          <span className={health ? "status-dot online" : "status-dot"} />
          <span>{health ? `Backend ${health.status}` : "Checking backend"}</span>
          {status === "loading" || status === "saving" ? <Loader2 className="spin" size={16} /> : null}
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <form className="survey-form" onSubmit={createSurvey}>
          <label>
            Survey title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Customer feedback"
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What should this survey help you learn?"
              rows="4"
            />
          </label>
          <button className="primary-button" type="submit" disabled={!canSubmit || status === "saving"}>
            <Send size={17} />
            Create survey
          </button>
        </form>

        <section className="survey-list" aria-label="Survey drafts">
          {surveys.map((survey) => (
            <article className="survey-card" key={survey.id}>
              <ClipboardList size={20} />
              <div>
                <h2>{survey.title}</h2>
                <p>{survey.description || "No description yet."}</p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default App;
