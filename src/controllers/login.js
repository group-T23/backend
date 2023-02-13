const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Buyer = require('../models/Buyer');
const Mail = require('../utils/email');

const loginUser = async(req, res) => {
    const data = req.body;
    const hash = crypto.createHash('sha256');
    const password = hash.update(data.password, 'utf-8').digest('hex');

    const result = await Buyer.findOne({ email: data.email });
    const token = jwt.sign(data.email, process.env.ACCESS_TOKEN);

    if (result && result.passwordHash == password)
        res.status(200).json({
            code: '0300', message: 'Success',
            user: {
                id: result.id,
                firstname: result.firstname,
                lastname: result.lastname,
                username: result.username,
                email: result.email,
                addresses: result.addresses,
                phone: result.phone,
                cart: result.cart,
                wishlist: result.wishlist,
                proposals: result.proposals,
                isVerified: result.isVerified,
                isSeller: result.isSeller,
                sellerId: result.sellerId,
                token: token
            }
        });
    else
        res.status(401).json({ code: '0303', message: 'Wront Credentials' });
}

const resetPassword = async(req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ code: '0302', message: 'Missing arguments' });

    const result = await Buyer.findOne({ email })
    if (!result) return res.status(403).json({ code: '0306', message: 'Invalid Email' })

    const hash = crypto.createHash('sha256');
    const random = crypto.randomBytes(16).toString('hex');
    const password = hash.update(random, 'utf-8').digest('hex');

    result.passwordHash = password;

    await result.save().catch(err => {
        console.log(err);
        return res.status(500).json({ code: '0301', message: 'Database Error' });
    })

    await Mail.send(result.email, 'Reset Password Skupply', `La tua nuova password è: ${random}\nPuoi cambiarla in ogni momento dal tuo profilo privato seguendo il seguente link ${process.env.FE_SERVER}/profile`);

    res.status(200).json({ code: '0300', message: 'Success' })
}

module.exports = { loginUser, resetPassword };