const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');

// To use between requests that need authentication priviligies
const verifyAuthentication = async(req, res, next) => {
    const authorization = req.headers['x-access-token'];
 
    if (!authorization)
        return res.status(403).json({ code: '1201', message: 'Missing Arguments' });

    const token = authorization.split(' ')[0];

    jwt.verify(token, process.env.ACCESS_TOKEN, async(err, email) => {
        if (err)
            return res.status(403).json({ code: '1202', message: 'Invalid Access Token' });

        if (!(await Buyer.exists({ email: email })))
            return res.status(403).json({ code: '1202', message: 'Invalid Access Token' });

        next();
    });
}

async function getAuthenticatedUser(req, res) {
    const token = req.headers['x-access-token'];

    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
        if (err)
            return res.status(403).json({ code: '1202', message: 'Invalid Access Token' });
        email = data;
    });

    let buyer;
    try {
        buyer = await Buyer.findOne({ email: email });
    } catch (error) {
        return res.status(500).json({ code: '1200', message: 'Database Error' });
    }

    return buyer;
}


module.exports = {
    verifyAuthentication,
    getAuthenticatedUser,
};