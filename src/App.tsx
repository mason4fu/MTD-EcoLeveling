import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sql-data')
      .then((res) => res.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="App">
      <h1>📊 SQL Data Table</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : rows.length === 0 ? (
        <p>No data available</p>
      ) : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header) => (
                  <td key={header}>{row[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
