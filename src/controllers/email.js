const validator = require('deep-email-validator');

const validateEmail = async (req, res) => {
  const result = await validator.validate(req.query.email);
  res.json({ available: result.valid });
};

module.exports = { validateEmail };