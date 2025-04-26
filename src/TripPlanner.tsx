import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ClipLoader from "react-spinners/ClipLoader";
import "./TripPlanner.css";

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0,
    lat = 0,
    lng = 0;
  while (index < encoded.length) {
    let b = 0,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

const getDefaultDate = () => new Date().toISOString().slice(0, 10);
const getDefaultTime = () => new Date().toTimeString().slice(0, 5);

// droplet pin icon factory
const createPinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `
    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 C8 2 4 6 4 10 C4 16 12 28 12 28 C12 28 20 16 20 10 C20 6 16 2 12 2 Z"
        fill="${color}" stroke="#fff" stroke-width="2"
      />
      <circle cx="12" cy="11" r="4" fill="#fff"/>
    </svg>
  `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });

const startIcon = createPinIcon("red");
const endIcon = createPinIcon("blue");

export default function TripPlanner() {
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState(getDefaultTime());
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(
    null
  );
  const [expandedTripIndex, setExpandedTripIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    if (!start) setStart({ lat, lng });
    else if (!end) setEnd({ lat, lng });
  };

  const SearchableMap = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  const findTrips = async () => {
    if (!start || !end || !date || !time) return;
    setLoading(true);
    setMessage("");
    setTrips([]);
    setSelectedTripIndex(null);
    const datetime = `${date}T${time}:00`;
    try {
      const res = await fetch("/api/trips/get-trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_lat: start.lat,
          start_lon: start.lng,
          end_lat: end.lat,
          end_lon: end.lng,
          datetime,
        }),
      });
      const data = await res.json();
      if (res.ok) setTrips(data);
      else setMessage(data.message || "No trips found.");
    } catch {
      setMessage("Server error.");
    } finally {
      setLoading(false);
    }
  };

  const confirmTrip = async () => {
    if (selectedTripIndex === null || !start || !end) return;
    const rawId = localStorage.getItem("user_id");
    if (!rawId) return alert("Please login first!");
    const user_id = Number(rawId);
    if (isNaN(user_id)) return alert("Invalid user ID");
    const datetime = `${date}T${time}:00`;
    try {
      const res = await fetch("/api/trips/confirm-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          trip: trips[selectedTripIndex],
          start_lat: start.lat,
          start_lon: start.lng,
          end_lat: end.lat,
          end_lon: end.lng,
          datetime,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Trip confirmed!");
        resetAll();
      } else alert("Error: " + (data.message || data.error));
    } catch {
      alert("Error confirming trip.");
    }
  };

  const resetAll = () => {
    setStart(null);
    setEnd(null);
    setDate(getDefaultDate());
    setTime(getDefaultTime());
    setTrips([]);
    setSelectedTripIndex(null);
    setExpandedTripIndex(null);
    setMessage("");
  };

  const renderTripPolyline = (trip: any) =>
    (trip.legs || []).map((leg: any, i: number) => {
      if (!leg.pointsOnLink?.points) return null;
      const pos = decodePolyline(leg.pointsOnLink.points);
      const color = leg.color || (leg.mode === "bus" ? "blue" : "black");
      return <Polyline key={i} positions={pos} color={color} />;
    });

  const isFindDisabled = !start || !end || !date || !time;
  const isConfirmDisabled = selectedTripIndex === null;

  return (
    <div className="planner-container">
      <h1>🚌 Trip Planner</h1>

      <div className="controls">
        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 200, height: 40, fontSize: "1rem" }}
          />
        </div>
        <div>
          <label>Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ width: 200, height: 40, fontSize: "1rem" }}
          />
        </div>
      </div>

      <div className="buttons">
        <button
          className="action-button"
          onClick={findTrips}
          disabled={isFindDisabled}
        >
          Find Trips
        </button>
        <button className="action-button" onClick={resetAll}>
          Refresh
        </button>
        <button
          className="action-button"
          onClick={confirmTrip}
          disabled={isConfirmDisabled}
        >
          Confirm Trip
        </button>
      </div>

      <div className="content-wrapper">
        <div className="map-section">
          <MapContainer
            center={[40.1106, -88.2073]}
            zoom={13}
            style={{ height: 400, width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchableMap />

            {start && (
              <Marker
                icon={startIcon}
                position={[start.lat, start.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => setStart(e.target.getLatLng()),
                }}
              >
                <Tooltip permanent direction="right">
                  Start
                </Tooltip>
              </Marker>
            )}

            {end && (
              <Marker
                icon={endIcon}
                position={[end.lat, end.lng]}
                draggable
                eventHandlers={{ dragend: (e) => setEnd(e.target.getLatLng()) }}
              >
                <Tooltip permanent direction="right">
                  End
                </Tooltip>
              </Marker>
            )}

            {selectedTripIndex !== null &&
              renderTripPolyline(trips[selectedTripIndex])}
          </MapContainer>

          <div className="location-info">
            <div>
              Start:{" "}
              {start
                ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}`
                : "None"}
            </div>
            <div>
              End:{" "}
              {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : "None"}
            </div>
          </div>
        </div>

        <div className="trips-list">
          {loading ? (
            <div className="loading">
              <ClipLoader size={50} />
            </div>
          ) : message ? (
            <p>{message}</p>
          ) : trips.length ? (
            <>
              <h2>Available Trips:</h2>
              <ul>
                {trips.map((trip, idx) => (
                  <li
                    key={idx}
                    className={`trip-item ${
                      selectedTripIndex === idx ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTripIndex(idx)}
                  >
                    <div>
                      <b>Trip {idx + 1}</b>: {trip.aimedStartTime.slice(11, 16)}{" "}
                      - {trip.aimedEndTime.slice(11, 16)}
                    </div>
                    <button
                      className="action-button"
                      onClick={() =>
                        setExpandedTripIndex(
                          expandedTripIndex === idx ? null : idx
                        )
                      }
                    >
                      {expandedTripIndex === idx
                        ? "Hide Details"
                        : "Show Details"}
                    </button>
                    {expandedTripIndex === idx && (
                      <div className="trip-details">
                        {trip.legs.map((leg: any, i: number) => (
                          <div key={i} className="leg-info">
                            {leg.mode === "bus" ? "🚌" : "🚶"}{" "}
                            {leg.fromPlace.name} → {leg.toPlace.name} (
                            {(leg.distance / 1000).toFixed(1)} km)
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
