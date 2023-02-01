const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const app = `http://localhost:${process.env.PORT}`;

describe('Cart test', () => {
    const fetch = require('node-fetch');
    const TIMEOUT = 50000;
    jest.setTimeout(TIMEOUT);
    
    beforeAll(async () => {
      await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
    });

    //test senza autenticazione
    test('test /cart - senza autorizzazione', async() => {
      const response = await request(app).post('/cart')
      expect(response.statusCode).toBe(403);
      expect({code: "", message: "Invalid access token"})
    });

    //test con autenticazione
    test('test /cart - con autorizzazione', async() => {
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN }
      }
    
      const result = (await fetch(`${app}/cart`, options).then(response => response.json()))
      expect(result).toMatchObject({"code": "400", "message": "success"})

      //verifica presenza parametro cart e cart_ids
      expect(result.cart).toBeDefined();
      expect(result.cart).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
      //questo test funziona nel caso in cui sia presente almeno un elemento

      //verifica che sotto l'attributo cart vi sia un array di oggetti contenente alcuni attributi degli articoli
      result.cart.forEach(element => {
        expect(element.quantity).toBeDefined();
        expect(element.quantity).toStrictEqual(expect.any(Number));
        expect(element._id).toBeDefined();
        expect(element.state).toBeDefined(); 
      })

      expect(result.cart_ids).toBeDefined();
      expect(result.cart_ids).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
      //questo test funziona nel caso in cui sia presente almeno un elemento

      //verifica che l'attributo quantity sia definita e che sia >=0
      result.cart_ids.forEach(element => {
          expect(element.quantity).toBeDefined();
          expect(element.quantity).toBeGreaterThan(0);
      })
    });

});