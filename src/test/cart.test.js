const request = require('supertest');
const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');
const app = `http://localhost:${process.env.PORT}`;

describe('Cart test', () => {
    const TIMEOUT = 20000;
    beforeAll(async () => {
      jest.setTimeout(TIMEOUT);
      await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
    });

    //test senza body
    test('test /cart endpoints', async() => {
        const response = await request(app).post('/cart');
        expect(response.statusCode).toBe(404);
        expect({code: "402", message: "missing arguments"})
    });

    //test con campo email di un user non valido
    test('test /cart endpoints', async() => {
        const body = {
            "email": "emailusernonvalido"
        }

        const response = await request(app)
        .post('/cart')
        .send(body);
        expect(response.statusCode).toBe(404);
        expect({code: "403", message: "user not found"})
    });

    //test con campo email di un user valido
    test('test /cart endpoints', async() => {
        const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
        if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

        const user = new Buyer({
          firstname: 'test',
          lastname: 'test',
          username: 'test',
          email: 'test@test.test',
          passwordHash: 'test',
          isVerified: false,
          verificationCode: 'fedcba9876543210'
        });
        
        await user.save(error => {
          if (error) console.log(error);
        });

        const body = { "email": "test@test.test" }

        const response = await request(app)
        .post('/cart')
        .send(body);
        expect(response.statusCode).toBe(200);
        expect({code: "400", message: "success"})

        //verifica presenza parametro cart e cart_ids
        expect(response.body.cart).toBeDefined();
        expect(response.body.cart).toEqual(expect.any(expect.arrayContaining([expect.any(Object)])))

         //verifica che sotto l'attributo cart vi sia un array di oggetti contenente alcuni attributi degli articoli
         response.body.cart.forEach(element => {
           expect(element.quantity).toBeDefined();
           expect(element.quantity).toStrictEqual(expect.any(Number));
           expect(element._id).toBeDefined();
           expect(element.state).toBeDefined(); 
        })

        expect(response.body.cart_ids).toBeDefined();
        expect(response.body.cart_ids).toEqual(expect.arrayContaining([expect.any(Object)]))

        //verifica che l'attributo quantity sia definita e che sia >=0
        response.body.cart_ids.forEach(element => {
            expect(element.quantity).toBeDefined();
            expect(element.quantity).toBeGreaterThan(0);
        })

        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    });


});