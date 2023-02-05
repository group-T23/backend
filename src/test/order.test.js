const dotenv = require('dotenv');
dotenv.config();
const Order = require("../models/Order");
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
            expect(response.orders[0]).toHaveProperty('article');
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
                seller: "639f6b399b38c1bfc9633360",
                article: {id: '63a034adb93b4039ab376a6c', quantity: 1},
                price: 10,
                shipment: 0,
                trackingCode: "trackingCodeTest",
                courier: "corriereTest"
            })
          }

        const response = (await fetch(`${url}/order`, options).then(response => response.json()))
        expect(response).toMatchObject({code: 1000, message: "success"});

        //cancellazione ordine creato
        //FIXME: va in timeout per qualche motivo, l'ordine viene creato
        await Order.deleteOne({"courier": "corriereTest"});
    });

});