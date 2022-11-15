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
app.use('/email', email);
app.use('/user', user);
app.use('/login', login);
app.use('/search', search);
app.use('/product', product);

const mail = require('./utils/email');
const PORT = process.env.PORT || 3000;

const main = async () => {
  await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
  //mail.send('dorijan.dizepp@studenti.unitn.it', 'Test', 'Test email');

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
}

main().catch(err => console.log(err));