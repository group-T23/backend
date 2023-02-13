const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const Item = require('../models/Item');

const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Search test', () => {

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);

        //creazione due articoli di prova
        let item = new Item({
            title: "Libro matematica",
            description: "Libro di matematica sui numeri complessi",
            ownerId: "63e50c0633652302f120e0f5",//id generato casualmente
            quantity:"1",
            categories: ["63a033e4498a01f9bada19d2"],//id generale
            photos: [`${"sellerId"}_${"1"}.${"XXX"}`],
            conditions: "NEW",
            price: "20",
            city: "Belluno",
            state: 'PUBLISHED',
            pickUpAvail: true,
            shipmentAvail: false,
            shipmentCost: 0.00,
        });
    
        await item.save().catch(err => {
            console.log(err);
        })

        item = new Item({
            title: "Quaderni",
            description: "Blocco di quaderno 10pz",
            ownerId: "63e50c0633652302f120e0f5",
            quantity:"20",
            categories: ["63a033e4498a01f9bada19d2"],
            photos: [`${"sellerId"}_${"1"}.${"XXX"}`],
            conditions: "NEW",
            price: "10",
            city: "Trento",
            state: 'PUBLISHED',
            pickUpAvail: true,
            shipmentAvail: true,
            shipmentCost: 10.00,
        });
    
        await item.save().catch(err => {
            console.log(err);
        })
      
    });

    afterAll(async() => {
        //cancellazione items di prova
        await Item.deleteMany({ownerId: "63e50c0633652302f120e0f5"});

        mongoose.disconnect();
    });

    //test search senza parametri
    test('tests /search - no parameters', async() => {
        const response = await request(app).get(`/search`);
        expect(response.statusCode).toBe(400)
        expect({ code: '0702', message: 'Missing Arguments' })
    });

    //test search con parametro key
    test('tests /search - key parameter', async() => {
        const response = await request(app)
            .get(`/search`)
            .query({ key: 'matematica' });
        expect(response.statusCode).toBe(200)
        expect({ code: '0700', message: 'Success' })

        //verifico che l'attributo articles sia presente
        expect(response.body.articles).toBeDefined();
    });

    //test search con parametro category
    test('tests /search - category parameter', async() => {
        const response = await request(app)
            .get(`/search`)
            .query({ category: 'generale' });
        expect(response.statusCode).toBe(200)
        expect({ code: '0700', message: 'Success' })

        //verifico che l'attributo articles sia presente
        expect(response.body.articles).toBeDefined();
    });

    //test search con parametro min-price
    test('tests /search - min price parameter', async() => {
        const response = await request(app)
            .get(`/search`)
            .query({ 'min-price': 30 });
        expect(response.statusCode).toBe(400)
        expect({ code: '0702', message: 'Missing Arguments' })

        //verifico che l'attributo articles non sia presente in quanto la risposta è di errore
        expect(response.body.articles).toBeUndefined();
    });

    //test search con parametro key e category
    test('tests /search - key and category parameters', async() => {
        const response = await request(app)
            .get(`/search`)
            .query({ key: 'quaderni', category: 'noCateogria' });
        expect(response.statusCode).toBe(404)
        expect({ code: '0705', message: 'Category Not Found' })

        //verifico che l'attributo articles non sia presente in quanto la risposta è di errore
        expect(response.body.articles).toBeUndefined();
    });

    //test search con parametro key, min-price e max-price
    test('tests /search - key, min price and max price parameters', async() => {
        const response = await request(app)
            .get(`/search`)
            .query({ key: 'matematica', "min-price": 0.5, "min-price": 125.7 });
        expect(response.statusCode).toBe(200)
        expect({ code: '0700', message: 'Success' })

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