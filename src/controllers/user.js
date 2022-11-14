const crypto = require('crypto');
const mail = require('../utils/email');
const User = require('../models/User');

const newUser = async (req, res) => {
  const url = require('../utils/address');

  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');

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
  });
  
  user.save((error, room) => {
    if (error) {
      console.log(error);
      res.json({ ok: false });
    } else {
      const code = room._id;
      mail.send(data.email, 'Creazione Account Skupply',
        `Grazie per aver scelto skupply.\n
        Per verificare l'account apra la seguente pagina:\n
        ${url}/verify/?id=${code}`
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

const loginUser = async (req, res) => {
  const data = req.body;
  const hash = crypto.createHash('sha256');
  const password = hash.update(data.password, 'utf-8').digest('hex');
  
  const result = await User.findOne({ email: data.email });
  if (result.password == password) res.json({ ok: true });
  else res.json({ ok: false });
}

module.exports = { newUser, findUser, loginUser };