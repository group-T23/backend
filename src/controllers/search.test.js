const request = require('supertest');
const app = `http://localhost:${process.env.PORT}`;

describe('Search test', () => {
    //test search senza parametri
    test('tests /search endpoints', async() => {
        const response = await request(app).get(`/search`);
        expect(response.statusCode).toBe(400);
    });

    //test search con parametro key
    test('tests /search endpoints', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({key: 'programmazione'});
        expect(response.statusCode).toBe(200)
        expect({code: "700", message: "success"})
        expect(response.body.articles).toBeDefined();
    });

    
    //test search con parametro category
    test('tests /search endpoints', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({category: 'università'});
        expect(response.statusCode).toBe(200)
        expect({code: "700", message: "success"})
        expect(response.body.articles).toBeDefined();
    });

    
    //test search con parametro min-price
    test('tests /search endpoints', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({'min-price': 30});
        expect(response.statusCode).toBe(400)
        expect({code: "702", message: "missing arguments"})
        expect(response.body.articles).toBeUndefined();
    });
    
    //test search con parametro key e category
    test('tests /search endpoints', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({key: 'programmazione', category: 'noCateogria'});
        expect(response.statusCode).toBe(404)
        expect({code: "704", message: "category not found"})
        expect(response.body.articles).toBeUndefined();
    });
});
