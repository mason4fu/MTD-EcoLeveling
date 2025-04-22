import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ClipLoader from "react-spinners/ClipLoader";
import "./TripPlanner.css";

function decodePolyline(encoded: string): [number, number][] {
  let points: [number, number][] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
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

function TripPlanner() {
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
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
    if (!start) {
      setStart({ lat, lng });
    } else if (!end) {
      setEnd({ lat, lng });
    }
  };

  const SearchableMap = () => {
    useMapEvents({ click: handleMapClick });
    return null;
  };

  const findTrips = async () => {
    if (!start || !end || !date || !time) {
      alert("Please select start, end, date, and time!");
      return;
    }
    setLoading(true);
    setMessage("");
    setTrips([]);
    setSelectedTripIndex(null);

    const datetime = new Date(`${date}T${time}`);

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
      if (res.ok) {
        setTrips(data);
      } else {
        setMessage(data.message || "No trips found.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error.");
    }
    setLoading(false);
  };

  const confirmTrip = async () => {
    if (selectedTripIndex === null) return;
    const trip = trips[selectedTripIndex];
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      alert("Please login first!");
      return;
    }

    try {
      const res = await fetch("/api/trips/confirm-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, trip }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Trip confirmed!");
        resetAll();
      } else {
        alert("Error: " + (data.message || data.error));
      }
    } catch (error) {
      console.error(error);
      alert("Error confirming trip.");
    }
  };

  const resetAll = () => {
    setStart(null);
    setEnd(null);
    setDate("");
    setTime("");
    setTrips([]);
    setSelectedTripIndex(null);
    setExpandedTripIndex(null);
    setMessage("");
  };

  const renderTripPolyline = (trip: any) => {
    const legs = trip.legs || [];
    const polylines: any[] = [];

    for (const leg of legs) {
      if (leg.pointsOnLink?.points) {
        const decoded = decodePolyline(leg.pointsOnLink.points);
        const color =
          leg.color || (leg.mode.toLowerCase() === "bus" ? "blue" : "black");
        polylines.push(
          <Polyline
            key={leg.id || Math.random()}
            positions={decoded}
            color={color}
          />
        );
      }
    }
    return polylines;
  };

  return (
    <div className="planner-container">
      <h1>🚌 Trip Planner</h1>

      <div className="controls">
        <div>
          <label>Date:</label>
          <br />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label>Time:</label>
          <br />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="buttons">
        <button
          className="action-button"
          onClick={findTrips}
          disabled={!start || !end || date === "" || time === ""}
        >
          Find Trips
        </button>
        <button className="action-button" onClick={resetAll}>
          Refresh
        </button>
        <button
          className="action-button"
          onClick={confirmTrip}
          disabled={selectedTripIndex === null}
        >
          Confirm Trip
        </button>
      </div>

      <div className="content-wrapper">
        <div className="map-section">
          <MapContainer
            center={[40.1106, -88.2073]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchableMap />
            {start && (
              <Marker
                position={[start.lat, start.lng]}
                icon={new L.Icon.Default()}
              >
                <Popup>Start</Popup>
              </Marker>
            )}
            {end && (
              <Marker position={[end.lat, end.lng]} icon={new L.Icon.Default()}>
                <Popup>End</Popup>
              </Marker>
            )}
            {selectedTripIndex !== null &&
              renderTripPolyline(trips[selectedTripIndex])}
          </MapContainer>

          <div className="location-info">
            <div className="location-item">
              <div>
                Start:{" "}
                {start
                  ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}`
                  : "None"}
              </div>
              <button className="action-button" onClick={() => setStart(null)}>
                Clear Start
              </button>
            </div>
            <div className="location-item">
              <div>
                End:{" "}
                {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : "None"}
              </div>
              <button className="action-button" onClick={() => setEnd(null)}>
                Clear End
              </button>
            </div>
          </div>
        </div>

        <div className="trips-list">
          {loading ? (
            <div className="loading">
              <ClipLoader size={50} color="#123abc" />
            </div>
          ) : message ? (
            <p>{message}</p>
          ) : trips.length > 0 ? (
            <>
              <h2>Available Trips:</h2>
              <ul>
                {trips.map((trip, idx) => (
                  <li
                    key={idx}
                    className={`trip-item ${
                      selectedTripIndex === idx ? "selected" : ""
                    }`}
                  >
                    <div
                      onClick={() => setSelectedTripIndex(idx)}
                      style={{ cursor: "pointer" }}
                    >
                      <b>Trip {idx + 1}</b>:{" "}
                      {trip.aimedStartTime?.slice(11, 16)} -{" "}
                      {trip.aimedEndTime?.slice(11, 16)}
                    </div>
                    <button
                      className="action-button"
                      onClick={() =>
                        setExpandedTripIndex(
                          expandedTripIndex === idx ? null : idx
                        )
                      }
                      style={{ marginTop: "5px" }}
                    >
                      {expandedTripIndex === idx
                        ? "Hide Trip Details"
                        : "Show Trip Details"}
                    </button>
                    {expandedTripIndex === idx && (
                      <div style={{ paddingLeft: "15px", marginTop: "10px" }}>
                        {trip.legs.map((leg: any, legIdx: number) => (
                          <div key={legIdx} style={{ marginBottom: "8px" }}>
                            {leg.mode.toLowerCase() === "bus" ? (
                              <div>
                                🚌 {leg.fromPlace.name} → {leg.toPlace.name} (
                                {(leg.distance / 1000).toFixed(1)} km)
                              </div>
                            ) : (
                              <div>
                                🚶 {leg.fromPlace.name} → {leg.toPlace.name} (
                                {(leg.distance / 1000).toFixed(1)} km)
                              </div>
                            )}
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

export default TripPlanner;
