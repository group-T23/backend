const dotenv = require('dotenv');
dotenv.config();
const url = `http://localhost:${process.env.PORT}`;

describe('Review test', () => {
    const fetch = require('node-fetch');
 
    //test recupero recensioni di un utente
    test('tests /review - recupero recensioni utente', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
          }

        const response = (await fetch(`${url}/review/seller/id=639f6b399b38c1bfc9633360`, options).then(response => response.json()))
        expect({code: "800", message: "success"})
        expect(response.reviews).toBeDefined();
        if(response.reviews.length != 0) {
            expect(response.reviews[0]).toHaveProperty('authorId');
            expect(response.reviews[0]).toHaveProperty('sellerId');
            expect(response.reviews[0]).toHaveProperty('title');
            expect(response.reviews[0]).toHaveProperty('description');
            expect(response.reviews[0]).toHaveProperty('rating');
        }
    });

    //test per recuperare tutte le recensioni scritte dall'utente autenticato
    test('tests /review - recupero recensioni scritte', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
          }

        const response = (await fetch(`${url}/review/out`, options).then(response => response.json()))
        expect({code: "800", message: "success"})
        expect(response.reviews).toBeDefined();
        if(response.reviews.length != 0) {
            expect(response.reviews[0]).toHaveProperty('authorId');
            expect(response.reviews[0]).toHaveProperty('sellerId');
            expect(response.reviews[0]).toHaveProperty('title');
            expect(response.reviews[0]).toHaveProperty('description');
            expect(response.reviews[0]).toHaveProperty('rating');
        }
    });

});