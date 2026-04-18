export function buildUserStats(trades = [], markets = []) {
  const marketMap = new Map(markets.map((market) => [String(market.id), market]));
  const chronologicalSettledTrades = [];
  let wins = 0;
  let losses = 0;
  let openTrades = 0;
  let totalVolume = 0;
  let realizedPnl = 0;

  for (const trade of trades) {
    totalVolume += Number(trade.amount || 0);
    const market = marketMap.get(String(trade.marketId));

    if (!market || market.status !== 'settled' || !market.result) {
      openTrades += 1;
      continue;
    }

    const isWin = trade.side === market.result;
    const pnl = isWin
      ? Number(trade.amount || 0) * Number(trade.oddsAtTrade || 0) - Number(trade.amount || 0)
      : -Number(trade.amount || 0);

    realizedPnl += pnl;
    chronologicalSettledTrades.push({
      createdAt: trade.createdAt,
      isWin
    });

    if (isWin) {
      wins += 1;
    } else {
      losses += 1;
    }
  }

  chronologicalSettledTrades.sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  let currentStreak = 0;
  let longestWinStreak = 0;
  let rollingWinStreak = 0;

  for (const trade of chronologicalSettledTrades) {
    if (trade.isWin) {
      rollingWinStreak += 1;
      longestWinStreak = Math.max(longestWinStreak, rollingWinStreak);
    } else {
      rollingWinStreak = 0;
    }
  }

  for (let index = chronologicalSettledTrades.length - 1; index >= 0; index -= 1) {
    if (!chronologicalSettledTrades[index].isWin) {
      break;
    }

    currentStreak += 1;
  }

  const settledTrades = wins + losses;
  const winRate = settledTrades ? (wins / settledTrades) * 100 : 0;

  return {
    wins,
    losses,
    openTrades,
    settledTrades,
    totalTrades: trades.length,
    totalVolume,
    realizedPnl,
    winRate,
    currentStreak,
    longestWinStreak
  };
}
