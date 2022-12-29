const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

// To use between requests that need authentication priviligies
const verifyAuthentication = async(req, res, next) => {
    const authorization = req.headers['x-access-token'];

    if (!authorization)
        return res.status(403).json({ code: "", message: 'Access token property is missing' });

    const token = authorization.split(' ')[0];
    jwt.verify(token, process.env.ACCESS_TOKEN, async(err, email) => {
        if (err)
            return res.status(403).json({ code: "", message: 'Invalid access token' });

        if (!(await Buyer.exists({ email: email })))
            return res.status(403).json({ code: "", message: 'Invalid access token' });

        next();
    });
}

async function getAuthenticatedBuyer(req, res) {
    const token = req.headers['x-access-token'].split(' ')[0];
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
        if (err)
            return res.status(403).json({ code: "", message: 'Invalid access token' });
        email = data;
    });

    let buyer;
    try {
        buyer = await Buyer.findOne({ email: email });
    } catch (error) {
        return res.status(500).json({ code: "", message: 'unable to access data' });
    }

    return buyer;
}


module.exports = {
    verifyAuthentication,
    getAuthenticatedBuyer,
};