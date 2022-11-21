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
    firstName: "Luigi",
    lastName: "Mario",
    username: "Prova",
    email: "luigi@gmail.com",
    password: hash.update("psw", 'utf-8').digest('hex'),
    isTerms: true,
    isVerified: false,
    verificationCode: "codiceACaso",
    cart : [{id: mongoose.Types.ObjectId('637a73ebea5a12c372d5b701')}, {id: mongoose.Types.ObjectId('637a74857cb16d707c2c8988')}]
  });

  user.save((err, data) => {
    if(err) console.log("err");
    else console.log("saved");
  });*/

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
}

main().catch(err => console.log(err));