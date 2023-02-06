const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');

//FIXME: in alcuni casi, i test danno esito negativo anche se sono corretti
//molto probabilmente l'errore è dovuto al fatto che il db non riesce ad aggiornasi in tempo 
//e alla richiesta successiva, mancano i dati che ci si aspetta facendo fallire il test

describe('Email requests', () => {
    const fetch = require('node-fetch');
    const url = `${process.env.SERVER}:${process.env.PORT}`;
    const TIMEOUT = 20000;
    jest.setTimeout(TIMEOUT);

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        mongoose.disconnect();
    });

    test('GET /email - Invalid arguments', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202, message: "Email argument is missing" });
    });

    test('GET /email - Valid email', async() => {

        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=wasdqwerty396@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 203, message: "Email reachable" });
    });

    test('GET /email - Email already used', async() => {
        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });

        const user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: 'test',
            isVerified: false,
            verificationCode: 'fedcba9876543210'
        });

        await user.save().catch(err => console.log(err))

        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 205, message: "Email already used" });
        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('GET /email - Email not reachable', async() => {
        const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 204, message: "Email not reachable" });
    });


    test('POST /email - Invalid code argument', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 202 });
    });

    test('POST /email - Invalid email argument', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: '0123456789abcdef' })
        };

        expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202, message: "Email argument is missing" });
    });

    test('POST /email - Email not associated to any account', async() => {
        const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: '0123456789abcdef' })
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 208, message: 'Email not associated to any account' });
    });

    test('POST /email - Invalid verification code', async() => {
        const code = '0123456789abcdef';

        const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: 'test',
            isVerified: false,
            verificationCode: 'fedcba9876543210'
        });

        await user.save().catch(err => console.log(err))

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        };

        let response = expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json()))
        response.toMatchObject({ code: 206, message: "Invalid verification code" });

        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('POST /email - Email already verified', async() => {
        const code = '0123456789abcdef';

        const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: 'test',
            isVerified: true,
            verificationCode: code
        });

        await user.save().catch(err => console.log(err))

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 207, message: "Email already verified" });

        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('POST /email - Email verified successfully', async() => {
        const code = '0123456789abcdef';

        let result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: 'test',
            isVerified: false,
            verificationCode: code
        });

        await user.save().catch(err => console.log(err))

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        };

        result = expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json()))
        result.toMatchObject({ code: 200, message: "Email verified successfully" });

        await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });
});