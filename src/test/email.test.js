const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');

describe('Email requests', () => {
    const fetch = require('node-fetch');
    const url = `${process.env.SERVER}:${process.env.PORT}`;
    const TIMEOUT = 20000;
    jest.setTimeout(TIMEOUT);

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    afterAll(async() => {
        //cancellazione profilo di testing se presente
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        mongoose.disconnect();
    });

    test('GET /email - Invalid arguments', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: '0202', message: 'Missing Arguments' });
    });

    test('GET /email - Valid email', async() => {

        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=wasdqwerty@gmail.com`, options).then(response => response.json())).toMatchObject({ code: '0204', message: 'Email Reachable' });
    });

    test('GET /email - Email already used', async() => {
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });

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

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: '0206', message: 'Email Already Used' });
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('GET /email - Email not reachable', async() => {
        const result = await Buyer.findOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=test@gmal.com`, options).then(response => response.json())).toMatchObject({ code: '0205', message: 'Email Not Reachable' });
    });


    test('POST /email - Invalid code argument', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: '0202', message: 'Missing Arguments' });
    });

    test('POST /email - Invalid email argument', async() => {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: '0123456789abcdef' })
        };

        expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: '0202', message: 'Missing Arguments' });
    });

    test('POST /email - Email not associated to any account', async() => {
        const result = await Buyer.findOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: '0123456789abcdef' })
        };

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: '0209', message: 'Email Not Associated' });
    });

    test('POST /email - Invalid verification code', async() => {
        const code = '0123456789abcdef';

        const result = await Buyer.findOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

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
        response.toMatchObject({ code: '0207', message: 'Invalid Verification Code' });

        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('POST /email - Email already verified', async() => {
        const code = '0123456789abcdef';

        const result = await Buyer.findOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

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

        expect(await fetch(`${url}/email?email=test@gmail.com`, options).then(response => response.json())).toMatchObject({ code: '0208', message: 'Email Already Verified' });

        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });

    test('POST /email - Email verified successfully', async() => {
        const code = '0123456789abcdef';

        let result = await Buyer.findOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        if (result) { await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] }); }

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
        result.toMatchObject({ code: '0200', message: 'Success' });

        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
    });
});