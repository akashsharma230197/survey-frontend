import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { api } from "../api.js";

const TYPOLOGIES = ["Commercial", "Transit", "Heritage", "Green", "Civic", "Mixed"];
const OWNERSHIPS = ["NDMC", "DDA", "ASI", "MCD", "Private"];
const ACCESS_MODES = ["Metro", "Bus", "Walk", "Drive"];
const LAND_USES = ["Residential", "Commercial", "Institutional", "Mixed"];

const initialForm = {
  name: "",
  location: "",
  lat: "",
  lng: "",
  typology: "",
  areaHectares: "",
  ownership: "",
  yearEstablished: "",
  accessibilityModes: [],
  peakVisitors: "",
  surroundingLandUse: []
};

function NewSite() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleMulti(field, value) {
    setForm((current) => {
      const set = new Set(current[field]);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...current, [field]: Array.from(set) };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const site = await api.createSite(form);
      navigate(`/sites/${site.id}`);
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  return (
    <section className="workspace">
      <div className="toolbar">
        <div>
          <p className="eyebrow">Module 1 · Site Profile Sheet</p>
          <h1>Add a site</h1>
        </div>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <form className="survey-form" onSubmit={submit}>
        <label>
          Site name
          <input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Lodhi Garden" required />
        </label>

        <label>
          Location (address)
          <input value={form.location} onChange={(event) => setField("location", event.target.value)} placeholder="Lodhi Road, New Delhi" />
        </label>

        <div className="field-row">
          <label>
            Latitude
            <input value={form.lat} onChange={(event) => setField("lat", event.target.value)} placeholder="28.5933" type="number" step="any" />
          </label>
          <label>
            Longitude
            <input value={form.lng} onChange={(event) => setField("lng", event.target.value)} placeholder="77.2197" type="number" step="any" />
          </label>
        </div>

        <label>
          Typology
          <select value={form.typology} onChange={(event) => setField("typology", event.target.value)}>
            <option value="">Select typology</option>
            {TYPOLOGIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label>
            Area (hectares)
            <input value={form.areaHectares} onChange={(event) => setField("areaHectares", event.target.value)} type="number" step="any" />
          </label>
          <label>
            Year established
            <input value={form.yearEstablished} onChange={(event) => setField("yearEstablished", event.target.value)} type="number" />
          </label>
        </div>

        <label>
          Ownership
          <select value={form.ownership} onChange={(event) => setField("ownership", event.target.value)}>
            <option value="">Select ownership</option>
            {OWNERSHIPS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="checkbox-group">
          <legend>Accessibility mode</legend>
          {ACCESS_MODES.map((option) => (
            <label className="checkbox-option" key={option}>
              <input
                type="checkbox"
                checked={form.accessibilityModes.includes(option)}
                onChange={() => toggleMulti("accessibilityModes", option)}
              />
              {option}
            </label>
          ))}
        </fieldset>

        <label>
          Peak visitors / day
          <input value={form.peakVisitors} onChange={(event) => setField("peakVisitors", event.target.value)} type="number" />
        </label>

        <fieldset className="checkbox-group">
          <legend>Surrounding land use</legend>
          {LAND_USES.map((option) => (
            <label className="checkbox-option" key={option}>
              <input
                type="checkbox"
                checked={form.surroundingLandUse.includes(option)}
                onChange={() => toggleMulti("surroundingLandUse", option)}
              />
              {option}
            </label>
          ))}
        </fieldset>

        <button className="primary-button" type="submit" disabled={status === "saving"}>
          <Save size={17} />
          Save site profile
        </button>
      </form>
    </section>
  );
}

export default NewSite;
