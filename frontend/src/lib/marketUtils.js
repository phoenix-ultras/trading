export function getMarketMetrics(market) {
  const yesPool = Number(market?.yesPool || 0);
  const noPool = Number(market?.noPool || 0);
  const totalPool = yesPool + noPool;

  return {
    yesPool,
    noPool,
    totalPool,
    yesOdds: yesPool > 0 ? totalPool / yesPool : 1,
    noOdds: noPool > 0 ? totalPool / noPool : 1
  };
}

export function isMarketTradeable(market) {
  if (!market) {
    return false;
  }

  if (market.status !== 'open') {
    return false;
  }

  return new Date(market.closingTime).getTime() > Date.now();
}

export function formatCoins(value) {
  return `${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })} coins`;
}

export function formatOdds(value) {
  return `${Number(value || 0).toFixed(2)}x`;
}

export function formatPercentage(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function formatClosingTime(value) {
  if (!value) {
    return '--';
  }

  return new Date(value).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}
