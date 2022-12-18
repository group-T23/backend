const mongoose = require('mongoose');
const User = require('../models/User');

describe('Email requests', () => {
  const fetch = require('node-fetch');
  const url = `http://localhost:${process.env.PORT}`;

  const TIMEOUT = 10000;
  beforeAll(async () => {
    jest.setTimeout(TIMEOUT);
    await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@skupply.sytwitn.mongodb.net/Skupply?retryWrites=true&w=majority`);
  });

  test('GET /email - Invalid arguments', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202 });
  });

  test('GET /email - Valid email', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=simone.rossi-2@studenti.unitn.it`, options).then(response => response.json())).toMatchObject({ code: 203 });
  });

  test('GET /email - Already used email', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=skupply.shop@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 205 });
  });

  test('GET /email - Not reachable email', async () => {
    const options = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 204 });
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

    expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202 });
  });

  test('POST /email - Email not associated to any account', async () => {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '0123456789abcdef' })
    };

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 208 });
  });

  test('POST /email - Invalid verification code', async () => {
    const code = '0123456789abcdef';

    const result = await User.findOne({ username: 'test', email: 'test@test.test' });
    expect(result).toBeFalsy();
    if (result) return;

    const user = new User({
      firstName: 'test',
      lastName: 'test',
      username: 'test',
      email: 'test@test.test',
      password: 'test',
      isVerified: true,
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

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 206 });

    await User.deleteOne({ username: 'test', email: 'test@test.test' });
  });

  test('POST /email - Email already verified', async () => {
    const code = '0123456789abcdef';

    const result = await User.findOne({ username: 'test', email: 'test@test.test' });
    expect(result).toBeFalsy();
    if (result) return;

    const user = new User({
      firstName: 'test',
      lastName: 'test',
      username: 'test',
      email: 'test@test.test',
      password: 'test',
      isVerified: true,
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

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 200 });

    User.deleteOne({ username: 'test', email: 'test@test.test' });
  });

  test('POST /email - Email verified successfully', async () => {
    const code = '0123456789abcdef';

    const result = await User.findOne({ username: 'test', email: 'test@test.test' });
    expect(result).toBeFalsy();
    if (result) return;

    const user = new User({
      firstName: 'test',
      lastName: 'test',
      username: 'test',
      email: 'test@test.test',
      password: 'test',
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

    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 200 });

    await User.deleteOne({ username: 'test', email: 'test@test.test' });
  });
});