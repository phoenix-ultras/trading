import { Link } from 'react-router-dom';
import { formatClosingTime, formatCoins, formatOdds, getMarketMetrics } from '../lib/marketUtils';

function MarketCard({ market, compact = false }) {
  const metrics = getMarketMetrics(market);

  return (
    <article className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-neon-green/20 transition-all duration-300 hover:scale-105 border border-gray-700/50 ${compact ? 'p-4' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <span className="inline-block bg-neon-green/20 text-neon-green text-xs font-semibold px-2 py-1 rounded-full mb-2">
            {market.category}
          </span>
          <h3 className={`text-white font-semibold ${compact ? 'text-lg' : 'text-xl'} mb-2`}>{market.title}</h3>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
          market.status === 'open' ? 'bg-green-500/20 text-green-400' :
          market.status === 'closed' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {market.status}
        </span>
      </div>

      {market.description && !compact ? (
        <p className="text-gray-400 text-sm mb-4">{market.description}</p>
      ) : null}

      <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-2'} gap-4 mb-4`}>
        <div className="text-center">
          <span className="text-gray-400 text-xs block">YES</span>
          <strong className="text-neon-green text-lg">{formatOdds(metrics.yesOdds)}</strong>
        </div>
        <div className="text-center">
          <span className="text-gray-400 text-xs block">NO</span>
          <strong className="text-cyan-400 text-lg">{formatOdds(metrics.noOdds)}</strong>
        </div>
        {!compact && (
          <>
            <div className="text-center">
              <span className="text-gray-400 text-xs block">Volume</span>
              <strong className="text-white text-lg">{formatCoins(metrics.totalPool)}</strong>
            </div>
            <div className="text-center">
              <span className="text-gray-400 text-xs block">Closing</span>
              <strong className="text-white text-sm">{formatClosingTime(market.closingTime)}</strong>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-between items-center">
        {!compact && (
          <span className="text-gray-500 text-xs">{market.settlementRule || 'Manual settlement rule'}</span>
        )}
        <Link 
          className="bg-neon-green hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          to={`/market/${market.id}`}
        >
          View Market
        </Link>
      </div>
    </article>
  );
}

export default MarketCard;
