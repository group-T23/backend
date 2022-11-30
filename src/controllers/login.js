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

//TODO inserire codici di ritorno
const loginUser = async (req, res) => {
  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');
  
  const result = await User.findOne({ email: data.email });
  const token = jwt.sign(data.email, process.env.ACCESS_TOKEN);

  if (result && result.password == password) res.status(200).json({code: "", message: "loged in", ok: true, firstname: result.firstName, 
  lastname: result.lastName, username: result.username, email: result.email, token: token });
  else res.status(404).json({code: "", message: "wrong credentials", ok: false});
}

//TODO inserire codici di ritorno
const verifyUser = async (req, res) => {
  const code = req.body.code;
  User.findOneAndUpdate({ verificationCode: code }, { $set: { isVerified: true } }, (error, result) => {
    if (error || !result) res.status(200).json({code: "", message: "token expired", ok: false })
    else res.status(404).json({code: "", message: "account verified", ok: true });
  });
}

module.exports = { loginUser, verifyUser };