const request = require('supertest');
const app = `http://localhost:${process.env.PORT}`;

describe('Search test', () => {
    //test search senza parametri
    test('tests /search - no parameters', async() => {
        const response = await request(app).get(`/search`);
        expect(response.statusCode).toBe(400)
        expect({code: "702", message: "missing arguments"})
    });

    //test search con parametro key
    test('tests /search - key parameter', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({key: 'programmazione'});
        expect(response.statusCode).toBe(200)
        expect({code: "700", message: "success"})
        
        //verifico che l'attributo articles sia presente
        expect(response.body.articles).toBeDefined();
    });

    //test search con parametro category
    test('tests /search - category parameter', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({category: 'università'});
        expect(response.statusCode).toBe(200)
        expect({code: "700", message: "success"})

        //verifico che l'attributo articles sia presente
        expect(response.body.articles).toBeDefined();
    });

    //test search con parametro min-price
    test('tests /search - min price parameter', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({'min-price': 30});
        expect(response.statusCode).toBe(400)
        expect({code: "702", message: "missing arguments"})

        //verifico che l'attributo articles non sia presente in quanto la risposta è di errore
        expect(response.body.articles).toBeUndefined();
    });
    
    //test search con parametro key e category
    test('tests /search - key and category parameters', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({key: 'programmazione', category: 'noCateogria'});
        expect(response.statusCode).toBe(404)
        expect({code: "704", message: "category not found"})

        //verifico che l'attributo articles non sia presente in quanto la risposta è di errore
        expect(response.body.articles).toBeUndefined();
    });

    //test search con parametro key, min-price e max-price
    test('tests /search - key, min price and max price parameters', async() => {
        const response = await request(app)
        .get(`/search`)
        .query({key: 'programmazione', "min-price": 0.5, "min-price": 125.7});
        expect(response.statusCode).toBe(200)
        expect({code: "700", message: "success"})

        //verifica presenza attributo articles
        expect(response.body.articles).toBeDefined()

        //verifica di alcuni attributi del json di risposta
        expect(response.body.articles).toEqual(expect.arrayContaining([expect.any(Object)]))

        //verifica che vi sia l'attributo categories
        response.body.articles.forEach(element => {
            expect(element).toHaveProperty("categories")
        })

        //verifica che sotto l'attributo categories vi sia un array di oggetti contenente _id ed id
        response.body.articles.forEach(element => {
            expect(element.categories).toStrictEqual(expect.arrayContaining([expect.any(String)]))
        })

        //verifica che l'attributo isPublished sia presente in tutti gli oggetti
        //e che tale valore sia vero
        response.body.articles.forEach(element => {
            expect(element.state).toBeDefined();
            expect(element.state).toBe("PUBLISHED");
        })
    });

});