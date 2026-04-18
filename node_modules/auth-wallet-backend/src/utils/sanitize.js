function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username) {
  return username.trim();
}

module.exports = {
  normalizeEmail,
  normalizeUsername
};
