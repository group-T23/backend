const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.use(express.json());

const cors = require("cors");
const corsOptions = { origin: '*', credentials: true, optionSuccessStatus: 200 };
app.use(cors(corsOptions));

const email = require('./routes/email');
const user = require('./routes/user');
const login = require('./routes/login');
const search = require('./routes/search');
const product = require('./routes/product');
const cart = require('./routes/cart');
app.use('/email', email);
app.use('/user', user);
app.use('/login', login);
app.use('/search', search);
app.use('/product', product);
app.use('/cart', cart);

const mail = require('./utils/email');
const PORT = process.env.PORT || 3000;

const main = async () => {
  await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

  /*
  prova inserimento utente con degli articoli già nel carrello
  inserendo degli ObjectId casuali
  
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  const User = require('./models/User');
  const user = new User({
    firstName: "Alessando",
    lastName: "ABC",
    username: "ABC",
    email: "alessandro@gmail.com",
    password: hash.update("psw", 'utf-8').digest('hex'),
    isTerms: true,
    isVerified: false,
    verificationCode: "randomCode",
    cart : [{id: mongoose.Types.ObjectId('637fb651b2e3472cfdc7c447')}, 
            {id: mongoose.Types.ObjectId('637fb65cfa72fc52c8f6533b')},
            {id: mongoose.Types.ObjectId('637fb6633409ee1e54ca1347')},
            {id: mongoose.Types.ObjectId('637fb6671417bdd1a6dbb6ef')},
            {id: mongoose.Types.ObjectId('637fb66cf9ce9036a74aeb8f')},
            {id: mongoose.Types.ObjectId('637fb6705afb2a80893e30f0')},
            {id: mongoose.Types.ObjectId('637fb67416df8d66d25e7920')}]
  });

  user.save((err, data) => {
    if(err) console.log(err);
    else console.log("saved");
  });*/

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
}

main().catch(err => console.log(err));