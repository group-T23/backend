const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const app = `http://localhost:${process.env.PORT}`;

describe('Item test', () => {
    const fetch = require('node-fetch');
    const TIMEOUT = 50000;
    jest.setTimeout(TIMEOUT);

    //test ricerca item per id
    test('tests /item - ricerca per id', async() => {
        const response = await request(app).get(`/item`)
        .query({id: '63a031fbff52385f7b1857de'});
        expect(response.statusCode).toBe(200)
        expect({code: "900", message: "success"})
        expect(response.body.item).toBeDefined();
        expect(response.body.item).toHaveProperty('title', "Testo introduttivo alla programmazione dinamica");
    });

    //test ricerca item senza passaggio id
    test('tests /item - ricerca senza id', async() => {
        const response = await request(app).get(`/item`)
        expect(response.statusCode).toBe(400)
        expect({code: "902", message: "missing arguments"})
        expect(response.body.item).toBeUndefined();
    });

    //test ricerca item con id non valido o non esistente
    test('tests /item - ricerca con id non valido o non presente', async() => {
        const response = await request(app).get(`/item`)
        .query({id: '63a0fffffffffffff'});
        expect(response.statusCode).toBe(400)
        expect({code: "903", message: "invalid arguments"})
    });

    //test ricerca items di un utente venditore
    test('tests /item - ricerca items di un venditore', async() => {
        const response = await request(app).get(`/item/seller`)
        .query({username: 'ap39'});
        expect(response.statusCode).toBe(200)
        expect({code: "900", message: "success"})
        expect(response.body.items).toBeDefined();
        expect(response.body.items).toStrictEqual(expect.arrayContaining([expect.any(Object)]))
    });

    //test ritiro item come non venditore
    test('tests /item - ritiro item', async() => {
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN }
          }

        const response = (await fetch(`${app}/item/retire?id=63a031fbff52385f7b1857de`, options).then(response => response.json()))
        expect({code: "904", message: "invalid user type"})
    });

});