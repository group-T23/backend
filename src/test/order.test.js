const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const url = `http://localhost:${process.env.PORT}`;

describe('Order test', () => {
    const fetch = require('node-fetch');
    const TIMEOUT = 50000;
    jest.setTimeout(TIMEOUT);

    //test recupero degli ordini fatti da un utente
    test('tests /order - ordini fatti da un utente', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
          }

        const response = (await fetch(`${url}/order/getAll`, options).then(response => response.json()))
        expect({code: "1000", message: "success"})
        expect(response.orders).toBeDefined();
        if(response.orders.length != 0) {
            expect(response.orders[0]).toHaveProperty('buyer');
            expect(response.orders[0]).toHaveProperty('articles');
            expect(response.orders[0]).toHaveProperty('price');
            expect(response.orders[0]).toHaveProperty('shipment');
            expect(response.orders[0]).toHaveProperty('state');
        }
    });

    //test creazione ordine
    test('tests /order - creazione ordine', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
            body: JSON.stringify({
                articles: [{id: '63a031fbff52385f7b1857de', quantity: 1}],
                price: 0.1,
                shipment: 0
            })
          }

        const response = (await fetch(`${url}/order`, options).then(response => response.json()))
        expect(response).toMatchObject({code: 1000, message: "success"});
    });

});