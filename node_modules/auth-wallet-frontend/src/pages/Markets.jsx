import { useEffect, useMemo, useState } from 'react';
import MarketCard from '../components/MarketCard';
import { getMarkets } from '../lib/api';

const categories = ['all', 'sports', 'creator', 'meme', 'product', 'trend'];

function Markets() {
  const [markets, setMarkets] = useState([]);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('latest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getMarkets({
          category,
          sort: sort === 'soon' ? 'closingSoon' : 'latest'
        });

        if (isMounted) {
          setMarkets(data.data || []);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.data?.message || 'Unable to load markets.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMarkets();

    return () => {
      isMounted = false;
    };
  }, [category, sort]);

  const summary = useMemo(() => {
    const totalVolume = markets.reduce((sum, market) => sum + Number(market.yesPool || 0) + Number(market.noPool || 0), 0);
    return {
      marketCount: markets.length,
      totalVolume
    };
  }, [markets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg text-light-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <span className="text-neon-green text-sm font-semibold">Market scanner</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Track every live narrative on one grid.
          </h1>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-green">{summary.marketCount}</div>
              <div className="text-gray-400 text-sm">Markets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{summary.totalVolume.toFixed(0)}</div>
              <div className="text-gray-400 text-sm">Volume (coins)</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="text-white font-semibold mb-3 block">Category</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((value) => (
                  <button
                    key={value}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      category === value
                        ? 'bg-neon-green text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    type="button"
                    onClick={() => setCategory(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-white font-semibold mb-3 block">Sort</span>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    sort === 'latest'
                      ? 'bg-neon-green text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  type="button"
                  onClick={() => setSort('latest')}
                >
                  Latest
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    sort === 'soon'
                      ? 'bg-neon-green text-black'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  type="button"
                  onClick={() => setSort('soon')}
                >
                  Closing soon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error and Loading */}
        {error ? <div className="bg-red-900/50 text-red-400 p-4 rounded-lg mb-8">{error}</div> : null}
        {isLoading ? <div className="text-center py-8 text-gray-400">Loading market board...</div> : null}

        {/* Market Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isLoading && !markets.length ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No markets match this filter.
            </div>
          ) : (
            markets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Markets;
