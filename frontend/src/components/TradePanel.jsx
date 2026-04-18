import { useMemo, useState } from 'react';
import { placeTrade } from '../lib/api';
import { formatCoins, formatOdds, getMarketMetrics, isMarketTradeable } from '../lib/marketUtils';

function TradePanel({ market, userId, onTradeExecuted }) {
  const [side, setSide] = useState('YES');
  const [amount, setAmount] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const metrics = useMemo(() => getMarketMetrics(market), [market]);
  const tradeable = isMarketTradeable(market);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError('Enter a valid trade amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await placeTrade({
        userId,
        marketId: market.id,
        side,
        amount: normalizedAmount
      });

      setSuccess(`${side} trade confirmed for ${formatCoins(normalizedAmount)}.`);
      onTradeExecuted?.(result);
      setAmount('100');
    } catch (tradeError) {
      setError(tradeError.data?.message || 'Unable to execute trade.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel trade-panel">
      <div className="trade-panel-head">
        <div>
          <span className="eyebrow">Trade ticket</span>
          <h2>Place position</h2>
        </div>
        <span className={`socket-badge ${tradeable ? 'socket-live' : 'socket-offline'}`}>
          {tradeable ? 'Market live' : 'Trading paused'}
        </span>
      </div>

      <div className="odds-grid">
        <button
          className={`odds-option ${side === 'YES' ? 'odds-option-active yes' : ''}`}
          type="button"
          onClick={() => setSide('YES')}
        >
          <span>YES</span>
          <strong>{formatOdds(metrics.yesOdds)}</strong>
        </button>
        <button
          className={`odds-option ${side === 'NO' ? 'odds-option-active no' : ''}`}
          type="button"
          onClick={() => setSide('NO')}
        >
          <span>NO</span>
          <strong>{formatOdds(metrics.noOdds)}</strong>
        </button>
      </div>

      <form className="trade-form" onSubmit={handleSubmit}>
        <label htmlFor="trade-amount">Amount</label>
        <input
          id="trade-amount"
          min="1"
          step="1"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={!tradeable || isSubmitting}
        />

        <div className="trade-summary">
          <span>Side</span>
          <strong>{side}</strong>
          <span>Potential multiplier</span>
          <strong>{formatOdds(side === 'YES' ? metrics.yesOdds : metrics.noOdds)}</strong>
        </div>

        {error ? <div className="form-error">{error}</div> : null}
        {success ? <div className="info-banner">{success}</div> : null}

        <button className="primary-button" disabled={!tradeable || isSubmitting || !userId} type="submit">
          {isSubmitting ? 'Executing...' : `Buy ${side}`}
        </button>
      </form>
    </section>
  );
}

export default TradePanel;
