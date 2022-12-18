const request = require('supertest');
const app = `http://localhost:${process.env.PORT}`;

describe('Cart test', () => {

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
        const body = {
            "email": "skupply.shop@gmail.com"
        }

        const response = await request(app)
        .post('/cart')
        .send(body);
        expect(response.statusCode).toBe(200);
        expect({code: "400", message: "success"})

        //verifica presenza parametro cart e cart_ids
        expect(response.body.cart).toBeDefined();
        expect(response.body.cart).toEqual(expect.arrayContaining([expect.any(Object)]))

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

    });


});