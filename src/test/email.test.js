const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Buyer = require('../models/Buyer');

describe('Email requests', () => {
  const fetch = require('node-fetch');
  const url = `http://localhost:${process.env.PORT}`;
  const TIMEOUT = 50000;
  jest.setTimeout(TIMEOUT);

  beforeAll(async () => {
    await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
  });

  test('GET /email - Invalid arguments', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202, message: "Email argument is missing" });
  });

  test('GET /email - Valid email', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=dorijan.dizepp2@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 203, message: "Email reachable" });
  });

  test('GET /email - Email already used', async () => {
    const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

    const user = new Buyer({
      firstname: 'test',
      lastname: 'test',
      username: 'test',
      email: 'test@test.test',
      passwordHash: 'test',
      isVerified: false,
      verificationCode: 'fedcba9876543210'
    });
    
    await user.save(error => {
      if (error) console.log(error);
    });

    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 205, message: "Email already used" });

    await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
  });

  test('GET /email - Email not reachable', async () => {
    const result = await Buyer.findOne({ email: 'test@test.test' });
    if (result) await Buyer.deleteOne({ email: 'test@test.test' });

    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 204, message: "Email not reachable" });
  });


  test('POST /email - Invalid code argument', async () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 202 });
  });

  test('POST /email - Invalid email argument', async () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '0123456789abcdef' })
    };

    expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202, message: "Email argument is missing" });
  });

  test('POST /email - Email not associated to any account', async () => {
    const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '0123456789abcdef' })
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 208, message: 'Email not associated to any account' });
  });

  test('POST /email - Invalid verification code', async () => {
    const code = '0123456789abcdef';

    const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

    const user = new Buyer({
      firstname: 'test',
      lastname: 'test',
      username: 'test',
      email: 'test@test.test',
      passwordHash: 'test',
      isVerified: false,
      verificationCode: 'fedcba9876543210'
    });
    
    await user.save(error => {
      if (error) console.log(error);
    });
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 206, message: "Invalid verification code" });

    await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
  });

  test('POST /email - Email already verified', async () => {
    const code = '0123456789abcdef';

    const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

    const user = new Buyer({
      firstname: 'test',
      lastname: 'test',
      username: 'test',
      email: 'test@test.test',
      passwordHash: 'test',
      isVerified: true,
      verificationCode: code
    });
    
    await user.save(error => {
      if (error) console.log(error);
    });
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 207, message: "Email already verified" });

    await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
  });

  test('POST /email - Email verified successfully', async () => {
    const code = '0123456789abcdef';

    const result = await Buyer.findOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
    if (result) await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });

    const user = new Buyer({
      firstname: 'test',
      lastname: 'test',
      username: 'test',
      email: 'test@test.test',
      passwordHash: 'test',
      isVerified: false,
      verificationCode: code
    });
    
    await user.save(error => {
      if (error) console.log(error);
    });
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 200, message: "Email verified successfully" });

    await Buyer.deleteOne({ $or: [{ username: 'test' }, { email: 'test@test.test' }] });
  });
});