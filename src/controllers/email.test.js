describe('Email requests', () => {
  const fetch = require('node-fetch');
  const url = `http://localhost:${process.env.PORT}`;

  const TIMEOUT = 10000;
  beforeAll(async () => {
    jest.setTimeout(TIMEOUT);
  });

  const options = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }
  
  test('GET /email - Invalid arguments', async () => {
    expect(await fetch(`${url}/email`, options).then(response => response.json())).toMatchObject({ code: 202 })
  });

  test('GET /email - Valid email', async () => {
    expect(await fetch(`${url}/email/?email=simone.rossi-2@studenti.unitn.it`, options).then(response => response.json())).toMatchObject({ code: 203 })
  });

  test('GET /email - Already used email', async () => {
    expect(await fetch(`${url}/email/?email=skupply.shop@gmail.com`, options).then(response => response.json())).toMatchObject({ code: 205 })
  });

  test('GET /email - Not reachable email', async () => {
    expect(await fetch(`${url}/email/?email=test@test.test`, options).then(response => response.json())).toMatchObject({ code: 204 })
  });
});