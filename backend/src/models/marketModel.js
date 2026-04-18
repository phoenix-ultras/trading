const db = require('../config/db');

const inMemoryMarkets = [];
let nextMarketId = 1;
const DB_FALLBACK_CODES = new Set(['ECONNREFUSED', '3D000', '42P01', 'ENOTFOUND']);

function mapMarket(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description || null,
    outcomeType: row.outcome_type ?? row.outcomeType ?? 'YES_NO',
    yesPool: Number(row.yes_pool ?? row.yesPool ?? 0),
    noPool: Number(row.no_pool ?? row.noPool ?? 0),
    createdBy: row.created_by ?? row.createdBy ?? null,
    createdAt: row.created_at ?? row.createdAt,
    closingTime: row.close_time ?? row.closingTime,
    settlementRule: row.settlement_rule ?? row.settlementRule ?? null,
    status: row.status ?? 'open',
    result: row.result ?? null
  };
}

function shouldUseMemoryFallback(error) {
  return DB_FALLBACK_CODES.has(error.code);
}

function sortMarkets(markets, sort = 'latest') {
  return [...markets].sort((left, right) => {
    if (sort === 'closingSoon') {
      return new Date(left.closingTime).getTime() - new Date(right.closingTime).getTime();
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

async function createMarket({
  title,
  category,
  description = null,
  closingTime,
  outcomeType = 'YES_NO',
  settlementRule = 'Based on official result / API / manual admin input',
  status = 'open',
  createdBy = null
}) {
  try {
    const result = await db.query(
      `INSERT INTO markets (
         title,
         category,
         description,
         outcome_type,
         yes_pool,
         no_pool,
         created_by,
         close_time,
         settlement_rule,
         status,
         result
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING
         id,
         title,
         category,
         description,
         outcome_type,
         yes_pool,
         no_pool,
         created_by,
         created_at,
         close_time,
         settlement_rule,
         status,
         result`,
      [title, category, description, outcomeType, 0, 0, createdBy, closingTime, settlementRule, status, null]
    );

    return mapMarket(result.rows[0]);
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) {
      throw error;
    }

    const market = {
      id: nextMarketId++,
      title,
      category,
      description,
      outcomeType,
      yesPool: 0,
      noPool: 0,
      createdBy,
      createdAt: new Date().toISOString(),
      closingTime,
      settlementRule,
      status,
      result: null
    };

    inMemoryMarkets.unshift(market);
    return market;
  }
}

async function listMarkets({ category, sort = 'latest' } = {}) {
  try {
    const values = [];
    let whereClause = '';

    if (category) {
      values.push(category);
      whereClause = `WHERE category = $${values.length}`;
    }

    const orderByClause = sort === 'closingSoon' ? 'ORDER BY close_time ASC' : 'ORDER BY created_at DESC';
    const result = await db.query(
      `SELECT
         id,
         title,
         category,
         description,
         outcome_type,
         yes_pool,
         no_pool,
         created_by,
         created_at,
         close_time,
         settlement_rule,
         status,
         result
       FROM markets
       ${whereClause}
       ${orderByClause}`,
      values
    );

    return result.rows.map(mapMarket);
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) {
      throw error;
    }

    const filteredMarkets = category
      ? inMemoryMarkets.filter((market) => market.category === category)
      : inMemoryMarkets;

    return sortMarkets(filteredMarkets, sort);
  }
}

async function getMarketById(id) {
  try {
    const result = await db.query(
      `SELECT
         id,
         title,
         category,
         description,
         outcome_type,
         yes_pool,
         no_pool,
         created_by,
         created_at,
         close_time,
         settlement_rule,
         status,
         result
       FROM markets
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] ? mapMarket(result.rows[0]) : null;
  } catch (error) {
    if (!shouldUseMemoryFallback(error)) {
      throw error;
    }

    return inMemoryMarkets.find((market) => String(market.id) === String(id)) || null;
  }
}

async function getMarketByIdForUpdate(client, id) {
  const result = await client.query(
    `SELECT
       id,
       title,
       category,
       description,
       outcome_type,
       yes_pool,
       no_pool,
       created_by,
       created_at,
       close_time,
       settlement_rule,
       status,
       result
     FROM markets
     WHERE id = $1
     FOR UPDATE`,
    [id]
  );

  return result.rows[0] ? mapMarket(result.rows[0]) : null;
}

async function updateMarketPools(client, { marketId, yesPool, noPool, status }) {
  const result = await client.query(
    `UPDATE markets
     SET yes_pool = $2,
         no_pool = $3,
         status = COALESCE($4, status)
     WHERE id = $1
     RETURNING
       id,
       title,
       category,
       description,
       outcome_type,
       yes_pool,
       no_pool,
       created_by,
       created_at,
       close_time,
       settlement_rule,
       status,
       result`,
    [marketId, yesPool, noPool, status ?? null]
  );

  return result.rows[0] ? mapMarket(result.rows[0]) : null;
}

async function settleMarket(client, { marketId, result: finalResult, status = 'settled' }) {
  const queryResult = await client.query(
    `UPDATE markets
     SET result = $2,
         status = $3
     WHERE id = $1
     RETURNING
       id,
       title,
       category,
       description,
       outcome_type,
       yes_pool,
       no_pool,
       created_by,
       created_at,
       close_time,
       settlement_rule,
       status,
       result`,
    [marketId, finalResult, status]
  );

  return queryResult.rows[0] ? mapMarket(queryResult.rows[0]) : null;
}

module.exports = {
  createMarket,
  listMarkets,
  getMarketById,
  getMarketByIdForUpdate,
  updateMarketPools,
  settleMarket
};
