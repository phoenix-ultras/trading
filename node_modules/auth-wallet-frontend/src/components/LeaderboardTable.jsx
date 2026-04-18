import { formatCoins, formatPercentage } from '../lib/marketUtils';

function LeaderboardTable({ entries, title = 'Leaderboard', subtitle }) {
  return (
    <section className="panel">
      <div className="section-header">
        <div>
          <span className="eyebrow">Competitive edge</span>
          <h2>{title}</h2>
        </div>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>

      <div className="table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Earnings</th>
              <th>Win rate</th>
              <th>Settled trades</th>
            </tr>
          </thead>
          <tbody>
            {entries.length ? (
              entries.map((entry, index) => (
                <tr key={`${entry.userId || entry.username}-${index}`}>
                  <td>#{entry.rank || index + 1}</td>
                  <td>{entry.username || 'Unknown trader'}</td>
                  <td>{formatCoins(entry.earnings || entry.realizedPnl || 0)}</td>
                  <td>{formatPercentage(entry.winRate || 0)}</td>
                  <td>{entry.settledTrades || entry.totalTrades || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-cell">
                  No leaderboard data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LeaderboardTable;
