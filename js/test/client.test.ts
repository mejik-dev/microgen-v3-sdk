import { MicrogenClient } from '../src';
import fs from 'node:fs';
import path from 'node:path';

const HOST = process.env.HOST || '';
const API_KEY = process.env.API_KEY || '';
const SERVICE_NAME = process.env.SERVICE_NAME || 'todos';
const SECOND_SERVICE_NAME = process.env.SECOND_SERVICE_NAME || 'categories';
const EMAIL = process.env.EMAIL || '';
const PASSWORD = process.env.PASSWORD || '';
const microgen = new MicrogenClient({
  host: HOST,
  apiKey: API_KEY,
});

interface Todo {
  _id: string;
  name: string;
  categories: [string];
}

interface Categories {
  _id: string;
  name: string;
  todos: [string];
}

interface User {
  _id: string;
  email: string;
  firstName: string;
}

test('it should create the client connection', async () => {
  expect(microgen).toBeDefined();
});

describe('Client', () => {
  let id: string;
  let secondId: string;
  let ids: string[];
  let key: string;

  const login = () => {
    return microgen.auth.login<User>({
      email: EMAIL,
      password: PASSWORD,
    });
  };

  beforeEach(async () => {
    await login();
    return true;
  });

  test('login', async () => {
    const response = await login();

    expect(response.status).toBe(200);
    expect(response.user?.email).toBe(EMAIL);

    const token = microgen.auth.token();

    expect(response.token).toBe(token);
  });

  test('login error', async () => {
    const response = await microgen.auth.login<User>({
      email: EMAIL,
      password: PASSWORD + '1',
    });

    expect(response.status).toBe(401);
    expect(typeof response.error?.message).toBe('string');
  });

  test('token', async () => {
    expect(microgen.auth.token() !== null).toBe(true);
  });

  test('user', async () => {
    const response = await microgen.auth.user<User>();

    expect(response.status).toBe(200);
    expect(response.user?.email).toBe(EMAIL);
  });

  test('update', async () => {
    const response = await microgen.auth.update<User>({
      firstName: 'Tester',
    });

    expect(response.status).toBe(200);
    expect(response.user?.email).toBe(EMAIL);
  });

  test('logout', async () => {
    const token = microgen.auth.token();
    const response = await microgen.auth.logout();

    expect(response.status).toBe(200);
    expect(response.token).toBe(token);
  });

  test('verify token', async () => {
    const token = microgen.auth.token();
    const response = await microgen.auth.verifyToken();

    expect(response.status).toBe(200);
    expect(response.token).toBe(token);
  });

  test('change password', async () => {
    const response = await microgen.auth.changePassword({
      oldPassword: PASSWORD,
      newPassword: PASSWORD,
    });

    expect(response.status).toBe(200);
  });

  test('create', async () => {
    const response = await microgen
      .service<Todo>(SERVICE_NAME)
      .create({ name: 'Hello' });

    id = response.data?._id || '';
    expect(response.status).toBe(201);
  });

  test('second create', async () => {
    const response = await microgen
      .service<Categories>(SECOND_SERVICE_NAME)
      .create({ name: 'Yes' });

    secondId = response.data?._id || '';
    expect(response.status).toBe(201);
  });

  test('createMany', async () => {
    const response = await microgen
      .service<Todo>(SERVICE_NAME)
      .createMany([{ name: 'foo' }, { name: 'bar' }]);

    ids = response.data?.map((item) => item._id) || [];
    expect(response.status).toBe(201);
  });

  test('find', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).find();

    expect(response.status).toBe(200);
  });

  test('find error', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME + '1').find();

    expect(response.status).toBe(404);
    expect(typeof response.error?.message).toBe('string');
  });

  test('getById', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).getById(id);

    expect(response.status).toBe(200);
  });

  test('updateById', async () => {
    const response = await microgen
      .service<Todo>(SERVICE_NAME)
      .updateById(id, { name: 'Hello updated' });

    expect(response.status).toBe(200);
  });

  test('updateMany', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).updateMany([
      { _id: ids[0], name: 'bar' },
      { _id: ids[1], name: 'foo' },
    ]);

    expect(response.status).toBe(200);
  });

  test('link', async () => {
    const response = await microgen
      .service<Todo>(SERVICE_NAME)
      .link(id, { [SECOND_SERVICE_NAME]: secondId });

    expect(response.status).toBe(200);
  });

  test('unlink', async () => {
    const response = await microgen
      .service<Todo>(SERVICE_NAME)
      .unlink(id, { [SECOND_SERVICE_NAME]: secondId });

    expect(response.status).toBe(200);
  });

  test('deleteById', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).deleteById(id);

    expect(response.status).toBe(200);
  });

  test('second deleteById', async () => {
    const response = await microgen
      .service<Categories>(SECOND_SERVICE_NAME)
      .deleteById(secondId);

    expect(response.status).toBe(200);
  });

  test('deleteMany', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).deleteMany(ids);

    expect(response.status).toBe(200);
  });

  test('count', async () => {
    const response = await microgen.service<Todo>(SERVICE_NAME).count();

    expect(response.status).toBe(200);
  });

  test('upload', async () => {
    const filePath = path.join(__dirname, 'icon.png');
    const file = await fs.openAsBlob(filePath);
    const response = await microgen.storage.upload(file, 'icon.png');

    expect(response.status).toBe(200);
  });

  test('fields', async () => {
    const response = await microgen.service(SERVICE_NAME).field.find();

    expect(response.status).toBe(200);
  });

  test('realtime get tableId', async () => {
    const { tableId } = await microgen.realtime.getTableId(SERVICE_NAME);

    if (tableId) {
      key = tableId;
    }

    expect(key).toBeTruthy;
  });

  test('realtime subscribe', () => {
    microgen.realtime.subscribe<Todo>(
      key,
      { event: '*', where: { name: 'tes' } },
      (message) => {
        console.log(message);
      },
    );
    expect(key).toBeTruthy();
  });

  test('realtime unsubscribe', () => {
    microgen.realtime.unsubscribe(key);
    expect(key).toBeTruthy();
  });
});

describe('Field', () => {
  let id: string;

  const login = () => {
    return microgen.auth.login<User>({
      email: EMAIL,
      password: PASSWORD,
    });
  };

  beforeEach(async () => {
    await login();
    return true;
  });

  test('find', async () => {
    const response = await microgen.service(SERVICE_NAME).field.find();

    id = response.data?.[0]?.id || '';
    expect(response.status).toBe(200);
  });

  test('getById', async () => {
    const response = await microgen.service(SERVICE_NAME).field.getById(id);

    expect(response.status).toBe(200);
  });
});
