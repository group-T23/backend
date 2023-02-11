const validator = require('deep-email-validator');
const Buyer = require('../models/Buyer');

const checkEmail = async(req, res) => {
    const email = req.query.email
    if (!email) { res.status(400).json({ code: '0202', message: 'Missing Arguments' }); return }

    const check = await Buyer.findOne({ email: email })
    if (check) { res.status(403).json({ code: '0206', message: 'Email Already Used' }); return }

    const result = await validator.validate({ email: email, validateSMTP: false });
    res.status(200).json(result.valid ? { code: '0204', message: 'Email Reachable' } : { code: '0205', message: 'Email Not Reachable' });
};

const verifyEmail = async(req, res) => {
    const code = req.body.code
    const email = req.query.email
    if (!code || !email) { res.status(400).json({ code: '0202', message: 'Missing Arguments' }); return }

    const check = await Buyer.findOne({ email: email })
    if (!check) { res.status(403).json({ code: '0209', message: 'Email Not Associated' }); return }
    if (check.isVerified) { res.status(200).json({ code: '0208', message: 'Email Already Verified' }); return; }

    if (check.verificationCode == code) {
        check.isVerified = true;
        try { await check.save(); }
        catch (error) { return res.status(500).json({ code: '0201', message: 'Database Error' }) }
        res.status(200).json({ code: '0200', message: 'Success' });
    } else { res.status(422).json({ code: '0207', message: 'Invalid Verification Code' }); }
}

module.exports = { checkEmail, verifyEmail };