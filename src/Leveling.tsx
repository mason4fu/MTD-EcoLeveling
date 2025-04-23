import React, { useEffect, useState } from 'react';
import './Leveling.css';

interface LeaderboardEntry {
  nickname: string;
  totalXP: number;
}

function Leveling() {
  const [userXP, setUserXP] = useState(0);
  const [levelMin, setLevelMin] = useState(0);
  const [levelMax, setLevelMax] = useState(100);
  const [userRank, setUserRank] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      window.location.href = '/';
      return;
    }

    fetch(`/api/leveling/info?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserXP(data.userXP);
        setLevelMin(data.levelMinXP);
        setLevelMax(data.levelMaxXP);
        setUserRank(data.rank);
        setLeaderboard(data.leaderboard);
      });
  }, []);

  const progressPercent = ((userXP - levelMin) / (levelMax - levelMin)) * 100;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Leveling Dashboard</h2>
      <div className="dashboard-flex">
        <div className="card">
          <p><strong>Rank:</strong> {userRank}</p>
          <p><strong>XP:</strong> {userXP} / {levelMax}</p>
          <div className="progress-labels">
            <span>{levelMin}</span>
            <span>{levelMax}</span>
          </div>
          <progress value={userXP - levelMin} max={levelMax - levelMin} className="progress-bar" />
          <p>Progress: {progressPercent.toFixed(1)}%</p>
        </div>
        <div className="card secondary">
          <h3>Top Users</h3>
          <ul className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <li key={index}>{entry.nickname} - {entry.totalXP} XP</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Leveling;