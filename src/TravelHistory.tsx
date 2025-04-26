import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TravelHistory.css";

function TravelHistory() {
  const [travelHistories, setTravelHistories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [busLegs, setBusLegs] = useState<any[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const userId = localStorage.getItem("user_id");

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      alert("Please login first.");
      navigate("/login");
    } else {
      fetchTravelHistory(currentPage);
    }
  }, [userId, currentPage]);

  const fetchTravelHistory = async (page: number) => {
    try {
      const res = await fetch(
        `/api/trips/history?user_id=${userId}&page=${page}`
      );
      const data = await res.json();
      if (res.ok) {
        setTravelHistories(data);
        setIsLastPage(data.length < 5);
      }
    } catch (error) {
      console.error("Error fetching travel history:", error);
    }
  };

  const fetchBusLegs = async (historyId: number) => {
    try {
      const res = await fetch(`/api/trips/history/${historyId}/legs`);
      const data = await res.json();
      if (res.ok) {
        setBusLegs(data);
      }
    } catch (error) {
      console.error("Error fetching bus legs:", error);
    }
  };

  const selectTrip = (trip: any) => {
    setSelectedTrip(trip);
    setNotes(trip.notes || "");
    setRating(trip.rating ?? 0);
    fetchBusLegs(trip.historyId);
  };

  const saveChanges = async () => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`/api/trips/history/${selectedTrip.historyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, rating }),
      });
      if (res.ok) {
        alert("Trip updated!");
        fetchTravelHistory(currentPage);
      } else {
        const data = await res.json();
        alert("Error: " + (data.message || data.error));
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const deleteTrip = async () => {
    if (!selectedTrip) return;
    if (!window.confirm("Are you sure you want to delete this trip?")) return;
    try {
      const res = await fetch(`/api/trips/history/${selectedTrip.historyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Trip deleted!");
        setSelectedTrip(null);
        setBusLegs([]);
        fetchTravelHistory(currentPage);
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "N/A";
    return isoString.slice(11, 16);
  };

  const generateUniqueKey = (leg: any, idx: number) => {
    return `${leg.legId || idx}-${leg.startTime || idx}`;
  };

  return (
    <div className="travel-history-container">
      <h1>🚌 Travel History</h1>

      <div className="history-content">
        {/* Left side: Trip list */}
        <div className="history-list">
          {travelHistories.map((trip) => (
            <div
              key={trip.historyId}
              className={`history-item ${
                selectedTrip?.historyId === trip.historyId ? "selected" : ""
              }`}
              onClick={() => selectTrip(trip)}
            >
              📅 {trip.travelDate} | 🕒{" "}
              {trip.tripId ? formatTime(trip.tripId) : ""}
            </div>
          ))}

          <div className="pagination-buttons">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={isLastPage}
            >
              Next
            </button>
          </div>
        </div>

        {/* Right side: Trip details */}
        <div className="detail-view">
          {selectedTrip ? (
            <>
              <h2>Trip Details</h2>
              <div>
                <b>Trip Date:</b> {selectedTrip.travelDate}
              </div>
              <div>
                <b>Trip Start Time:</b>{" "}
                {selectedTrip.tripId ? formatTime(selectedTrip.tripId) : ""}
              </div>

              <div className="legs-section">
                <h3>Bus Legs:</h3>
                {busLegs.length > 0 ? (
                  <table className="legs-table">
                    <thead>
                      <tr>
                        <th>Bus</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Distance (km)</th>
                        <th>Duration (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {busLegs.map((leg: any, idx: number) => (
                        <tr key={generateUniqueKey(leg, idx)}>
                          <td>{leg.busRouteName || "Unknown"}</td>
                          <td>{leg.fromPlace || "Unknown"}</td>
                          <td>{leg.toPlace || "Unknown"}</td>
                          <td>{formatTime(leg.startTime)}</td>
                          <td>{formatTime(leg.endTime)}</td>
                          <td>
                            {typeof leg.distanceKm === "number"
                              ? leg.distanceKm.toFixed(1)
                              : "0.0"}
                          </td>
                          <td>
                            {typeof leg.durationMinutes === "number"
                              ? leg.durationMinutes.toFixed(1)
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No bus legs found.</div>
                )}
              </div>

              <div className="edit-fields">
                <label htmlFor="notesEdit" style={{ fontWeight: "bold" }}>
                  Edit Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Edit Notes"
                />
                <label htmlFor="ratingSelect" style={{ fontWeight: "bold" }}>
                  Trip Rating:
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="history-actions">
                <button onClick={saveChanges}>Save Changes</button>
                <button onClick={deleteTrip} className="delete-button">
                  Delete Trip
                </button>
              </div>
            </>
          ) : (
            <div className="select-message">
              Select a trip to view and edit details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TravelHistory;
