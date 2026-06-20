import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { api } from "../api.js";

const markerIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const initialForm = { activityCode: "", demographicTag: "", groupSize: "", lat: "", lng: "", notes: "" };

function ObservationTool() {
  const { siteId } = useParams();
  const { site } = useOutletContext();
  const [activityCodes, setActivityCodes] = useState([]);
  const [observations, setObservations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    api
      .listObservations(siteId)
      .then((data) => {
        setActivityCodes(data.activityCodes);
        setObservations(data.observations);
        setStatus("ready");
      })
      .catch((requestError) => {
        setError(requestError.message);
        setStatus("error");
      });
  }

  useEffect(load, [siteId]);

  async function addObservation(event) {
    event.preventDefault();
    if (!form.activityCode) return;
    setStatus("saving");
    setError("");
    try {
      await api.createObservation(siteId, form);
      setForm(initialForm);
      load();
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }

  async function removeObservation(observationId) {
    try {
      await api.deleteObservation(siteId, observationId);
      setObservations((current) => current.filter((observation) => observation.id !== observationId));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const mapCenter = [site?.lat ?? 28.6139, site?.lng ?? 77.209];
  const pinned = observations.filter((observation) => observation.lat !== null && observation.lng !== null);

  return (
    <div>
      <p className="eyebrow">Module 4 · Behaviour Observation (SOPARC)</p>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="map-shell">
        <MapContainer center={mapCenter} zoom={16} style={{ height: "320px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pinned.map((observation) => (
            <Marker key={observation.id} position={[observation.lat, observation.lng]} icon={markerIcon}>
              <Popup>
                <strong>{observation.activityCode}</strong>
                {observation.demographicTag ? ` · ${observation.demographicTag}` : ""}
                <br />
                {observation.notes}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <form className="survey-form" onSubmit={addObservation}>
        <div className="field-row">
          <label>
            Activity code
            <select value={form.activityCode} onChange={(event) => setForm({ ...form, activityCode: event.target.value })}>
              <option value="">Select activity</option>
              {activityCodes.map((activity) => (
                <option key={activity.code} value={activity.code}>
                  {activity.code} · {activity.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Group size
            <input value={form.groupSize} onChange={(event) => setForm({ ...form, groupSize: event.target.value })} type="number" />
          </label>
        </div>
        <label>
          Demographic tag
          <input
            value={form.demographicTag}
            onChange={(event) => setForm({ ...form, demographicTag: event.target.value })}
            placeholder="Gender + age + ability"
          />
        </label>
        <div className="field-row">
          <label>
            Latitude
            <input value={form.lat} onChange={(event) => setForm({ ...form, lat: event.target.value })} type="number" step="any" />
          </label>
          <label>
            Longitude
            <input value={form.lng} onChange={(event) => setForm({ ...form, lng: event.target.value })} type="number" step="any" />
          </label>
        </div>
        <label>
          Notes
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows="3" />
        </label>
        <button className="primary-button" type="submit" disabled={status === "saving" || !form.activityCode}>
          <Plus size={17} />
          Log observation
        </button>
      </form>

      {status === "loading" ? (
        <p className="status-row">
          <Loader2 className="spin" size={16} /> Loading observations
        </p>
      ) : null}

      <table className="attribute-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Demographic</th>
            <th>Group size</th>
            <th>Observed at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {observations.map((observation) => (
            <tr key={observation.id}>
              <td>{observation.activityCode}</td>
              <td>{observation.demographicTag || "-"}</td>
              <td>{observation.groupSize ?? "-"}</td>
              <td>{new Date(observation.observedAt).toLocaleString()}</td>
              <td>
                <button className="icon-button" type="button" onClick={() => removeObservation(observation.id)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ObservationTool;
