const { matchedData } = require('express-validator');
const tradeService = require('../services/tradeService');

async function placeTrade(req, res, next) {
  try {
    const payload = matchedData(req, { locations: ['body'] });
    const result = await tradeService.placeTrade(payload);

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getTradesByUserId(req, res, next) {
  try {
    const trades = await tradeService.getTradesByUserId(req.params.id);

    return res.status(200).json({
      success: true,
      data: trades
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  placeTrade,
  getTradesByUserId
};
