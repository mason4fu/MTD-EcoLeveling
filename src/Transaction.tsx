import React, { useState, useEffect } from "react";

interface UserStat {
  0: string; // NickName
  1: number; // total_trips
}

interface RouteStat {
  0: string; // Route_Long_Name
  1: number; // leg_count
  2: number; // total_distance
}

function Transaction() {
  const [userLeaderboard, setUserLeaderboard] = useState<UserStat[]>([]);
  const [routeAnalytics, setRouteAnalytics] = useState<RouteStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions/transaction")
      .then(res => res.json())
      .then(data => {
        setUserLeaderboard(data.user_leaderboard);
        setRouteAnalytics(data.route_analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Users With Most Trips Taken</h2>
      <table>
        <thead>
          <tr>
            <th>Nickname</th>
            <th>Total Trips</th>
          </tr>
        </thead>
        <tbody>
          {userLeaderboard.map((row, idx) => (
            <tr key={idx}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Longest MTD Routes</h2>
      <table>
        <thead>
          <tr>
            <th>Route Name</th>
            <th>Leg Count</th>
            <th>Total Distance</th>
          </tr>
        </thead>
        <tbody>
          {routeAnalytics.map((row, idx) => (
            <tr key={idx}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
              <td>{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Transaction;