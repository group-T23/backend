const jwt = require('jsonwebtoken');

// To use between requests that need authentication priviligies
const verifyAuthentication = (req, res, next) => {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];
  if (!token) return res.sendStatus(400).json({ message: 'Access token property is missing' });

  jwt.verify(token, process.env.ACCESS_TOKEN, (error, email) => {
    if (error) return res.sendStatus(401).json({ message: 'Invalid access token' });
    next();
  });
}

module.exports = { verifyAuthentication };