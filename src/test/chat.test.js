const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const crypto = require('crypto');

const app = `${process.env.SERVER}:${process.env.PORT}`;

describe('Chat test', () => {
    const fetch = require('node-fetch');
    let chatId;

    beforeAll(async() => {
        await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
        //cancellazione profili di testing se presente
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        await Buyer.deleteOne({ $and: [{ username: 'tset' }, { email: 'tset@gmail.com' }] });

        //creazione account
        //hash della password del profilo (test)
        let hash = crypto.createHash('sha256');
        let password = hash.update('test', 'utf-8').digest('hex');

        let user = new Buyer({
            firstname: 'test',
            lastname: 'test',
            username: 'test',
            email: 'test@gmail.com',
            passwordHash: password,
            isVerified: true,
            verificationCode: 'fedcba9876543210',
        });

        await user.save().catch(err => console.log(err))

        hash = crypto.createHash('sha256');
        password = hash.update('test', 'utf-8').digest('hex');

        user = new Buyer({
            firstname: 'tset',
            lastname: 'tset',
            username: 'tset',
            email: 'tset@gmail.com',
            passwordHash: password,
            isVerified: true,
            verificationCode: 'fedcba9876543211',
        });

        await user.save().catch(err => console.log(err))

        //creazione della chat fra i due profilo e creazione di qualche messaggio
        let user1 = await Buyer.findOne({ email: "test@gmail.com" });
        let user2 = await Buyer.findOne({ email: "tset@gmail.com" });

        let message1 = new Message({
            sender: { id: user1._id },
            text: "Ciao, prova messaggio test..."
        });

        let message2 = new Message({
            sender: { id: user2._id },
            text: "Ciao, risposta alla prova messaggio test..."
        });

        await message1.save().catch(err => console.log(err));
        await message2.save().catch(err => console.log(err));

        message1 = await Message.findOne({ text: "Ciao, prova messaggio test..." });
        message2 = await Message.findOne({ text: "Ciao, risposta alla prova messaggio test..." });

        let chat = new Chat({
            user1: { id: user1._id },
            user2: { id: user2._id },
            messages: [message1._id, message2._id]
        });

        await chat.save().catch(err => console.log(err));
        chatId = chat._id

        //sovrascrivo i profili con la nuova chat
        chat = await Chat.findOne({ user1: { id: user1._id }, user2: { id: user2._id } });
        user1.chats = [chat._id];
        user2.chats = [chat._id];

        user = user1;
        await user.save().catch(err => console.log(err));
    });

    afterAll(async() => {
        //cancellazione profili di testing se presente
        let user1 = await Buyer.findOne({ email: "test@gmail.com" });
        await Buyer.deleteOne({ $and: [{ username: 'test' }, { email: 'test@gmail.com' }] });
        await Buyer.deleteOne({ $and: [{ username: 'tset' }, { email: 'tset@gmail.com' }] });

        //cancellazione chat e messaggi
        await Message.deleteOne({ text: "Ciao, prova messaggio test..." });
        await Message.deleteOne({ text: "Ciao, risposta alla prova messaggio test..." });

        await Chat.deleteOne({ _id: chatId })

        mongoose.disconnect();
    })

    //test recupero chat utente
    test('tests /chat - recupero chat utente', async() => {
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@gmail.com',
                password: 'test'
            })
        }

        const access = (await fetch(`${app}/login`, options).then(response => response.json()))
        let token = access.user.token;

        options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token }
        }

        const response = (await fetch(`${app}/chat?username=test`, options).then(response => response.json()))
        expect(response).toMatchObject({ code: 800, message: "Success" })
        expect(response.chats).toBeDefined();
        expect(response.chats[0]).toHaveProperty('messages');
    });

    //test recupero messaggi da una chat
    test('tests /chat - recupero messaggi chat', async() => {
        let options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@gmail.com',
                password: 'test'
            })
        }

        const access = (await fetch(`${app}/login`, options).then(response => response.json()))
        let token = access.user.token;

        options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token }
        }

        const response = (await fetch(`${app}/chat/message?username=test&contact=tset`, options).then(response => response.json()))
        expect(response).toMatchObject({ code: 800, message: "Success" })
        expect(response.messages).toBeDefined();
        expect(response.messages[0]).toHaveProperty('sender');
        expect(response.messages[0]).toHaveProperty('text');
        expect(response.messages[0]).toHaveProperty('date');
    });
});