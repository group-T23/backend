const crypto = require('crypto');
const mail = require('../utils/email');
const User = require('../models/User');

const newUser = async (req, res) => {
  const url = require('../utils/address');

  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');

  let code, result;
  do {
    code = crypto.randomBytes(32).toString('hex');
    result = await User.findOne({ verificationCode: code });
  } while (result);

  const user = new User({
    firstName: data.firstName,
    lastName: data.lastName,
    username: data.username,
    email: data.email,
    password: password,
    address: data.address,
    phone: data.phone,
    isSeller: data.seller,
    isTerms: true,
    isVerified: false,
    verificationCode: code,
  });
  
  user.save(error => {
    if (error) {
      console.log(error);
      res.json({ ok: false });
    } else {
      mail.send(data.email, 'Creazione Account Skupply',
        `Grazie per aver scelto skupply.\n
        Per verificare l'account apra la seguente pagina:\n
        ${url}/verify/?code=${code}`
      );
      res.json({ ok: true })
    }
  });
};

const findUser = async (req, res) => {
  const username = req.query.username;
  const result = await User.findOne({ username: username });
  res.json({ available: ( result ? false : true ) });
};

module.exports = { newUser, findUser };