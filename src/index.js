const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();

const search = require('./routes/search');
const product = require('./routes/product');
app.use('/search', search);
app.use('/product', product);

const PORT = process.env.PORT || 3000;

const main = async () => {
  await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

  /*
  const UserSchema = new mongoose.Schema({
    name: String
  }, { collection: 'Users' });

  const User = mongoose.model('User', UserSchema);
  const user = new User({ name: 'Mario' });
  await user.save();

  const users = await User.find();
  */

  app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
}

main().catch(err => console.log(err));