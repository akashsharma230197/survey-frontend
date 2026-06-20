import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { api } from "../api.js";

const initialForm = { name: "", needs: "", painPoints: "", dataLink: "", journeyStages: "Entry, Movement, Activity, Exit" };

function PersonaTool() {
  const { siteId } = useParams();
  const [personas, setPersonas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    api
      .listPersonas(siteId)
      .then((data) => {
        setPersonas(data);
        setStatus("ready");
      })
      .catch((requestError) => {
        setError(requestError.message);
        setStatus("error");
      });
  }

  useEffect(load, [siteId]);

  async function addPersona(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setStatus("saving");
    setError("");
    const journey = form.journeyStages
      .split(",")
      .map((stage) => stage.trim())
      .filter(Boolean)
      .map((stage) => ({ stage, note: "" }));

    try {
      await api.createPersona(siteId, { ...form, journey });
      setForm(initialForm);
      load();
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  async function removePersona(personaId) {
    try {
      await api.deletePersona(siteId, personaId);
      setPersonas((current) => current.filter((persona) => persona.id !== personaId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div>
      <p className="eyebrow">Module 6 · Persona & User Journey Toolkit</p>

      {error ? <p className="error-message">{error}</p> : null}

      <form className="survey-form" onSubmit={addPersona}>
        <label>
          Persona name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Asha (wheelchair user)" required />
        </label>
        <label>
          Needs
          <input value={form.needs} onChange={(event) => setForm({ ...form, needs: event.target.value })} placeholder="Ramps, tactile paving, smooth surfaces" />
        </label>
        <label>
          Pain points
          <input
            value={form.painPoints}
            onChange={(event) => setForm({ ...form, painPoints: event.target.value })}
            placeholder="Broken surfaces, no ramps, inaccessible toilets"
          />
        </label>
        <label>
          Journey stages (comma-separated)
          <input value={form.journeyStages} onChange={(event) => setForm({ ...form, journeyStages: event.target.value })} />
        </label>
        <label>
          Data link
          <input value={form.dataLink} onChange={(event) => setForm({ ...form, dataLink: event.target.value })} placeholder="AI1 gap, AI2 gap, SQ7" />
        </label>
        <button className="primary-button" type="submit" disabled={status === "saving" || !form.name.trim()}>
          <Plus size={17} />
          Add persona
        </button>
      </form>

      {status === "loading" ? (
        <p className="status-row">
          <Loader2 className="spin" size={16} /> Loading personas
        </p>
      ) : null}

      <div className="persona-grid">
        {personas.map((persona) => (
          <div className="persona-card" key={persona.id}>
            <div className="persona-card-header">
              <h3>{persona.name}</h3>
              <button className="icon-button" type="button" onClick={() => removePersona(persona.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
            {persona.needs ? (
              <p>
                <strong>Needs:</strong> {persona.needs}
              </p>
            ) : null}
            {persona.painPoints ? (
              <p>
                <strong>Pain points:</strong> {persona.painPoints}
              </p>
            ) : null}
            {persona.journey?.length ? (
              <div className="journey-map">
                {persona.journey.map((stage, index) => (
                  <span className="journey-stage" key={`${stage.stage}-${index}`}>
                    {stage.stage}
                  </span>
                ))}
              </div>
            ) : null}
            {persona.dataLink ? <p className="muted">Linked data: {persona.dataLink}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonaTool;
