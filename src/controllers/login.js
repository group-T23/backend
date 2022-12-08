const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

//TODO inserire codici di ritorno
const loginUser = async (req, res) => {
  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');
  
  const result = await User.findOne({ email: data.email });
  const token = jwt.sign(data.email, process.env.ACCESS_TOKEN);

  if (result && result.password == password) res.status(200).json({code: "", message: "loged in", ok: true, firstname: result.firstName, 
  lastname: result.lastName, username: result.username, email: result.email, token: token });
  else res.status(401).json({code: "", message: "wrong credentials", ok: false});
}

module.exports = { loginUser };