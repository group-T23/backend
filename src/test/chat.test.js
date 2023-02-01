const dotenv = require('dotenv');
dotenv.config();

const request = require('supertest');
const app = `http://localhost:${process.env.PORT}`;

describe('Chat test', () => {
    const fetch = require('node-fetch');
    const url = `http://localhost:${process.env.PORT}`;
    const TIMEOUT = 50000;
    jest.setTimeout(TIMEOUT);

    //test recupero chat utente
    test('tests /chat - recupero chat utente', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
          }

        const response = (await fetch(`${url}/chat?username=najirod`, options).then(response => response.json()))
        expect({code: "800", message: "success"})
        expect(response.chats).toBeDefined();
        expect(response.chats[0]).toHaveProperty('messages');
    });

    //test recupero messaggi da una chat
    test('tests /chat - recupero messaggi chat', async() => {
        const options = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-access-token': process.env.ACCESS_TOKEN },
          }

        const response = (await fetch(`${url}/chat/message?username=najirod&contact=sic`, options).then(response => response.json()))
        expect({code: "800", message: "success"})
        expect(response.messages).toBeDefined();
        expect(response.messages[0]).toHaveProperty('sender');
        expect(response.messages[0]).toHaveProperty('text');
        expect(response.messages[0]).toHaveProperty('date');
    });
});