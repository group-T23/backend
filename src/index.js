const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const cors = require("cors");
const corsOptions = { origin: '*', credentials: true, optionSuccessStatus: 200 };
app.use(cors(corsOptions));

const email = require('./routes/email');
const login = require('./routes/login');
const search = require('./routes/search');
const cart = require('./routes/cart');
const chat = require('./routes/chat');
const wishlist = require('./routes/wishlist');
const proposal = require('./routes/proposal');
const review = require('./routes/review');
const buyer = require('./routes/buyer');
const seller = require('./routes/seller');
const item = require('./routes/item');
app.use('/email', email);
app.use('/login', login);
app.use('/search', search);
app.use('/cart', cart);
app.use('/chat', chat);
app.use('/wishlist', wishlist);
app.use('/proposal', proposal);
app.use('/review', review);
app.use('/buyer', buyer);
app.use('/seller', seller);
app.use('/item', item);


// Media endpoint
app.use(express.static('media'))

const mail = require('./utils/email');
const PORT = process.env.PORT || 3000;

const main = async() => {
    await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

    /*
  const Review = require('./models/Review');
  const review = new Review({
    authorId: mongoose.Types.ObjectId('639f6b399b38c1bfc963335e'),
    sellerId: mongoose.Types.ObjectId('639f3ed128d35b18679024d7'),
    title: "Recensione ASD",
    description: "Appunti disorganizati e ad un prezzo troppo alto",
    rating: 2,
  });
  review.save();
*/
    /*
    const Category = require('./models/Category');
    const categoria = new Category({
        title: "superiori",
        description: "Articoli scolastici per le superiori",
    });
    
    categoria.save();
*/
/*
    const Article = require('./models/Item');
    const articolo = new Article({
      title: "Testo introduzione alla chimica",
      description: "testo introduttivo alla chimica",
      ownerId: mongoose.Types.ObjectId('639f6b399b38c1bfc9633360'),
      quantity: 1,
      categories: [mongoose.Types.ObjectId('63a034204e998e6183cf2b04')],
      photos: ["/pathImmagine"],
      conditions: "USED",
      price: 15.7,
      city: "Belluno",
      state: "PUBLISHED",
    });

      articolo.save((err, data) => {
        if(err) console.log(err);
        else console.log("saved");
      });*/

      /*
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      console.log(hash.update("Alessandro02!", 'utf-8').digest('hex'));
      

    
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