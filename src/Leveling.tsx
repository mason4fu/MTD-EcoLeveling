import React, { useEffect, useState } from 'react';
import './Leveling.css';

interface LeaderboardEntry {
  nickname: string;
  totalXP: number;
  rank?: string;
  userRank?: string;
  co2Saved?: number;
}

function Leveling() {
  const [userXP, setUserXP] = useState(0);
  const [levelMin, setLevelMin] = useState(0);
  const [levelMax, setLevelMax] = useState(100);
  const [userRank, setUserRank] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchNickname, setSearchNickname] = useState('');
  const [searchedUser, setSearchedUser] = useState<LeaderboardEntry | null>(null);
  const [userCO2Saved, setUserCO2Saved] = useState<number>(0);

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
        setUserCO2Saved(data.userCO2Saved);
      });
  }, []);

  const progressPercent = ((userXP - levelMin) / (levelMax - levelMin)) * 100;

  const handleSearch = () => {
    fetch('/api/users/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nickname: searchNickname })
    })
    .then(res => res.json())
    .then(data => {
      if (data && data.nickname) {
        setSearchedUser(data);
      } else {
        alert('User not found!');
        setSearchedUser(null);
      }
    })
    .catch(() => {
      alert('Error searching user.');
      setSearchedUser(null);
    });
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Your Leveling Dashboard</h2>
      <div className="dashboard-flex">
        <div className="card">
          <h3>My Progress</h3>
          <p><strong>Rank:</strong> {userRank}</p>
          <p><strong>XP:</strong> {userXP} / {levelMax}</p>
          <p><strong>CO₂ Saved:</strong> {userCO2Saved ?? 'N/A'} kg</p>
          <div className="progress-labels">
            <span>{levelMin}</span>
            <span>{levelMax}</span>
          </div>
          <progress value={userXP - levelMin} max={levelMax - levelMin} className="progress-bar" />
          <p>Progress: {progressPercent.toFixed(1)}%</p>
        </div>

        <div className="card">
          <h3>Compare Yourself</h3>
          <input
            type="text"
            placeholder="Enter nickname"
            value={searchNickname}
            onChange={(e) => setSearchNickname(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch}>Search</button>

          {searchedUser && (
            <>
              <div className="search-results compare-grid">
                <div className="compare-card">
                  <strong>You:</strong>
                  <p>XP: {userXP}</p>
                  <p>Rank: {userRank}</p>
                  <p>CO₂ Saved: {userCO2Saved ?? 'N/A'} kg</p>
                </div>
                <div className="compare-card">
                  <strong>{searchedUser.nickname}:</strong>
                  <p>XP: {searchedUser.totalXP}</p>
                  <p>Rank: {searchedUser.userRank ?? 'N/A'}</p>
                  <p>CO₂ Saved: {searchedUser.co2Saved ?? 'N/A'} kg</p>
                </div>
              </div>

              <div className="catchup-results">
                {searchedUser.totalXP > userXP ? (
                  <>
                    <p>🚀 You need {searchedUser.totalXP - userXP} XP to catch up!</p>
                    <p>🚌 That’s approximately {Math.ceil((searchedUser.totalXP - userXP) / 100)} average trips!</p>
                  </>
                ) : (
                  <>
                    <p>🎉 You are ahead by {userXP - searchedUser.totalXP} XP!</p>
                    <p>💪 Keep it up! 🚀</p>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="card secondary">
          <h3>Rank {userRank}: Top Users</h3>
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