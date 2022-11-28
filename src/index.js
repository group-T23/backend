const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
const Article = require('./models/Article');
const PORT = process.env.PORT || 3000;

const main = async () => {
  await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

  /*
  const Article = require('./models/Article');
  const articolo = new Article({
    title: "Set squadre 30° e 45°",
    description: "Vendo vari set da coppie di squadre da 30° e 45° per disegno tecnico",
    state: "Come nuove",
    price: "15",
    quantity: "20",
    shipment: "disponibile",
    handDeliver: false,
    isPublished: true,
    categories: [{id: mongoose.Types.ObjectId('6380a78ee40a0ae7c100383c')}],
    photos: [{path: "/pathImmagine"}],
  });

  articolo.save((err, data) => {
    if(err) console.log(err);
    else console.log("saved");
  });*/


/*
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256');
  const User = require("./models/User");
  const user = new User({
    firstName: "Alessandro",
    lastName: "De Bona",
    username: "Ale_DB",
    email: "alessandro@gmail.com",
    password: hash.update("psw", 'utf-8').digest('hex'),
    verificationCode: "codiceDiVerifica"
  });

  user.save((err, data)=>{
    if(err) console.log(err);
    else console.log("saved");
  });*/

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
}

main().catch(err => console.log(err));