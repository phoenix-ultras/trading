const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const marketModel = require('../models/marketModel');
const tradeModel = require('../models/tradeModel');
const walletModel = require('../models/walletModel');
const userModel = require('../models/userModel');

function normalizeMarketState(market) {
  if (!market) {
    return market;
  }

  const closingTimeMs = new Date(market.closingTime).getTime();
  if (market.status === 'open' && Number.isFinite(closingTimeMs) && closingTimeMs <= Date.now()) {
    return { ...market, status: 'closed' };
  }

  return market;
}

function ensureOpenMarketForTrading(market) {
  const normalizedMarket = normalizeMarketState(market);

  if (!normalizedMarket) {
    throw new ApiError(404, 'Market not found');
  }

  if (normalizedMarket.status !== 'open') {
    throw new ApiError(400, 'Market is not open for trading');
  }

  const closingTimeMs = new Date(normalizedMarket.closingTime).getTime();
  if (!Number.isFinite(closingTimeMs)) {
    throw new ApiError(400, 'Market closing time is invalid');
  }

  if (Date.now() >= closingTimeMs) {
    throw new ApiError(400, 'Trading is closed for this market');
  }

  return normalizedMarket;
}

function calculateOdds({ yesPool, noPool }) {
  const normalizedYesPool = Number(yesPool) || 0;
  const normalizedNoPool = Number(noPool) || 0;
  const totalPool = normalizedYesPool + normalizedNoPool;

  return {
    yesOdds: normalizedYesPool > 0 ? totalPool / normalizedYesPool : Math.max(totalPool, 1),
    noOdds: normalizedNoPool > 0 ? totalPool / normalizedNoPool : Math.max(totalPool, 1),
    totalPool
  };
}

async function getMarketOdds(marketId) {
  const market = normalizeMarketState(await marketModel.getMarketById(marketId));

  if (!market) {
    throw new ApiError(404, 'Market not found');
  }

  return calculateOdds(market);
}

async function placeTrade({ userId, marketId, side, amount }) {
  const normalizedAmount = Number(amount);

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new ApiError(400, 'Trade amount must be greater than zero');
  }

  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const market = ensureOpenMarketForTrading(await marketModel.getMarketByIdForUpdate(client, marketId));
    const wallet = await walletModel.findWalletByUserIdForUpdate(client, userId);

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    const walletBalance = Number(wallet.balance);
    if (walletBalance < normalizedAmount) {
      throw new ApiError(400, 'Insufficient wallet balance');
    }

    const odds = calculateOdds(market);
    const oddsAtTrade = side === 'YES' ? odds.yesOdds : odds.noOdds;

    const nextPools = {
      yesPool: side === 'YES' ? Number(market.yesPool) + normalizedAmount : Number(market.yesPool),
      noPool: side === 'NO' ? Number(market.noPool) + normalizedAmount : Number(market.noPool)
    };

    const updatedWallet = await walletModel.updateWalletBalances(client, {
      userId,
      balance: walletBalance - normalizedAmount,
      lockedBalance: Number(wallet.locked_balance)
    });

    const updatedMarket = await marketModel.updateMarketPools(client, {
      marketId,
      yesPool: nextPools.yesPool,
      noPool: nextPools.noPool,
      status: Date.now() >= new Date(market.closingTime).getTime() ? 'closed' : market.status
    });

    const trade = await tradeModel.createTrade(client, {
      userId,
      marketId,
      side,
      amount: normalizedAmount,
      oddsAtTrade
    });

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Trade executed',
      updatedWallet: Number(updatedWallet.balance),
      market: normalizeMarketState(updatedMarket),
      trade
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function settleMarket({ marketId, result }) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const market = normalizeMarketState(await marketModel.getMarketByIdForUpdate(client, marketId));

    if (!market) {
      throw new ApiError(404, 'Market not found');
    }

    const closingTimeMs = new Date(market.closingTime).getTime();
    if (market.status === 'open' && Number.isFinite(closingTimeMs) && Date.now() < closingTimeMs) {
      throw new ApiError(400, 'Market cannot be settled before closing time');
    }

    if (market.status === 'settled') {
      throw new ApiError(400, 'Market is already settled');
    }

    const trades = await tradeModel.listTradesByMarketId(marketId, client);
    const payoutsByUser = new Map();

    for (const trade of trades) {
      if (trade.side !== result) {
        continue;
      }

      const payout = Number(trade.amount) * Number(trade.oddsAtTrade);
      payoutsByUser.set(trade.userId, (payoutsByUser.get(trade.userId) || 0) + payout);
    }

    for (const [userId, payout] of payoutsByUser.entries()) {
      const wallet = await walletModel.findWalletByUserIdForUpdate(client, userId);

      if (!wallet) {
        continue;
      }

      await walletModel.updateWalletBalances(client, {
        userId,
        balance: Number(wallet.balance) + payout,
        lockedBalance: Number(wallet.locked_balance)
      });
    }

    const settledMarket = await marketModel.settleMarket(client, {
      marketId,
      result,
      status: 'settled'
    });

    await client.query('COMMIT');

    return {
      success: true,
      message: 'Market settled successfully',
      market: settledMarket,
      settledTrades: trades.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getTradesByUserId(userId) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return tradeModel.listTradesByUserId(userId);
}

module.exports = {
  calculateOdds,
  getMarketOdds,
  placeTrade,
  settleMarket,
  getTradesByUserId
};
