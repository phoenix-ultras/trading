const walletService = require('../services/walletService');

async function getWallet(req, res, next) {
  try {
    const wallet = await walletService.getWalletByUserId(req.user.sub);

    return res.status(200).json({
      username: req.user.username,
      ...wallet
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getWallet
};
