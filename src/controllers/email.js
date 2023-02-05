const validator = require('deep-email-validator');
const Buyer = require('../models/Buyer');

const checkEmail = async(req, res) => {
    const email = req.query.email
    if (!email) { res.status(400).json({ code: 202, message: 'Email argument is missing' }); return }

    const check = await Buyer.findOne({ email: email })
    console.log("checkEMail ----------------------------------");
    console.log(check);
    if (check) { res.status(403).json({ code: 205, message: 'Email already used' }); return }

    const result = await validator.validate(email);
    res.status(200).json(result.valid ? { code: 203, message: 'Email reachable' } : { code: 204, message: 'Email not reachable' });
};

const verifyEmail = async(req, res) => {
    const code = req.body.code
    const email = req.query.email
    if (!code) { res.status(400).json({ code: 202, message: 'Code argument is missing' }); return }
    if (!email) { res.status(400).json({ code: 202, message: 'Email argument is missing' }); return }

    const check = await Buyer.findOne({ email: email })
    console.log("verifyEmail ----------------------------------");
    console.log(check);
    if (!check) { res.status(403).json({ code: 208, message: 'Email not associated to any account' }); return }
    if (check.isVerified) { res.status(200).json({ code: 207, message: "Email already verified" }); return; }

    if (check.verificationCode == code) {
      check.isVerified = true;
      await check.save();
      res.status(200).json({ code: 200, message: "Email verified successfully" });
    } else {res.status(200).json({ code: 206, message: "Invalid verification code" });}
}

module.exports = { checkEmail, verifyEmail };