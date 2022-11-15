const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// To use between requests that need authentication priviligies
const authenticateUser = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN, (error, email) => {
    if (error) return res.sendStatus(403);
    req.email = email;
    next();
  });
}

const loginUser = async (req, res) => {
  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');
  
  const result = await User.findOne({ email: data.email });
  const token = jwt.sign(data.email, process.env.ACCESS_TOKEN);
  if (result.password == password) res.json({ ok: true, token: token });
  else res.json({ ok: false });
}

module.exports = { loginUser };