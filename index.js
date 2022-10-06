const PORT = 3000;

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();

const main = async () => {
  // Per stabilire una connessione dovete creare un file .env che contenga:
  // DB_NAME="<nome>"
  // DB_PASSWORD="<password>"
  // dove <nome> é il nome del profilo mongodb che puó accedere al database e <password> la corrispettiva password
  // https://cloud.mongodb.com/v2/6336f0714f8c8f14fe055311#security/database/users
  await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

  // Inizio Test
  // Il test crea uno Schema che definisce la struttura di User
  // Dopodiché ne crea ed instanzia un modello per poi salvarlo
  // Infine facciamo la ricerca di tutti gli User nella Collection Users
  const UserSchema = new mongoose.Schema({
    name: String
  }, { collection: 'Users' });

  const User = mongoose.model('User', UserSchema);
  const user = new User({ name: 'Mario' });
  await user.save();

  const users = await User.find();
  console.log(users);
  // Fine Test
}

main();