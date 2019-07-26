import request from 'supertest';
import matchers from 'jest-supertest-matchers';
import faker from 'faker';
import { User } from '../models'; //eslint-disable-line
import app from '..';

const testUserGenerator = () => ({
  form: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  },
});

const testUser = testUserGenerator();
const authUser = { form: { email: testUser.form.email, password: testUser.form.password } };

describe('requests', () => {
  let server;

  beforeAll(() => {
    expect.extend(matchers);
  });

  beforeAll(async () => {
    await User.sync({ force: true });
    await User.build(authUser.form);
    server = app().listen();
  });

  it('status 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('status 404', async () => {
    const res = await request.agent(server)
      .get('/wrongPath');
    expect(res).toHaveHTTPStatus(404);
  });

  it('GET /users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /users/new', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /users', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send(testUser);
    expect(res).toHaveHTTPStatus(302);
  });

  it('GET /session/new', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /session', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send(testUser);
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /session', async () => {
    const authRes = await request.agent(server)
      .post('/session')
      .type('form')
      .send(authUser);
    expect(authRes.status).toBe(302);

    const res = await request.agent(server)
      .delete('/session');
    expect(res.status).toBe(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
