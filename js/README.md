# Microgen SDK

This is the Official Node JS and Browser client/library for Microgen API. Visit https://microgen.id. More information about the product and see documentation at http://docs.microgen.id for more technical details.

## API Documentation

Please check [Microgen API Reference](http:/docs.microgen.id).

## Installation

### Node.js

To install microgen in a node project:

```bash
npm install --save microgen-v3-sdk
```

## Usage

Configure package with your account's **API key** obtained from your [Microgen Dashboard](https://microgen.id).

```js
const { MicrogenClient } = require('microgen-v3-sdk');

const microgen = new MicrogenClient({
  apiKey: '*******************',
});
```

## Authentication

Use microgen auth services for manage your user.

### Register

```js
const { user, token, error } = await microgen.auth.register({
  firstName: 'Ega',
  lastName: 'Radiegtya',
  email: 'user@gmail.com',
  password: 'password',
});
```

### Login

```js
const { user, token, error } = await microgen.auth.login({
  email: 'user@gmail.com',
  password: 'password',
});
```

### User

```js
const { user, error } = await microgen.auth.user();
```

```js
// Get user with filter:
// lookup
const { user, error } = await microgen
  .auth
  .user({ filterKey: filterValue, ... });
```

### Update

```js
const { user, error } = await microgen.auth.update({ firstName: 'Ega' });
```

### Logout

```js
const { user, token, error } = await microgen.auth.logout();
```

## Database

### Create

```js
const { data, error } = await microgen.service('posts').create({
  name: 'Post 1',
  notes: 'Hello microgen',
});
```

### Create Many

```js
const { data, error } = await microgen.service('posts').createMany([
  {
    name: 'Post 1',
    notes: 'Hello microgen',
  },
  {
    name: 'Post 2',
    notes: 'Hello world',
  },
]);
```

### Get

```js
const { data, error } = await microgen
  .service('posts')
  .getById('605a251d7b8678bf6811k3b1');
```

```js
// Get record with filters:
// select
// lookup
const { data, error } = await microgen
  .service('posts')
  .getById('605a251d7b8678bf6811k3b1', { filterKey: filterValue, ... });
```

### Update

```js
const { data, error } = await microgen
  .service('posts')
  .updateById('605a251d7b8678bf6811k3b1', {
    notes: 'Hello world',
  });
```

### Update Many

```js
const { data, error } = await microgen.service('posts').updateMany([
  {
    _id: '605a251d7b8678bf6811k3b1',
    notes: 'Hello world',
  },
  {
    _id: '605a251d7b8678bf6811k3b2',
    notes: 'Hello microgen',
  },
]);
```

### Delete

```js
const { data, error } = await microgen
  .service('posts')
  .deleteById('605a251d7b8678bf6811k3b1');
```

### Delete Many

```js
const { data, error } = await microgen
  .service('posts')
  .deleteMany(['605a251d7b8678bf6811k3b1', '605a251d7b8678bf6811k3b2']);
```

### Link

```js
const { data, error } = await microgen
  .service('posts')
  .link('605a251d7b8678bf6811k3b1', {
    categories: '61d26e8e2adb12b85c33029c',
  });
```

### Unlink

```js
const { data, error } = await microgen
  .service('posts')
  .unlink('605a251d7b8678bf6811k3b1', {
    categories: '61d26e8e2adb12b85c33029c',
  });
```

### Find

```js
const { data, error } = await microgen.service('posts').find();
```

```js
// sort
// 1 = ascending
// -1 = descending
const { data, error } = await microgen
  .service('posts')
  .find({ sort: [{ name: 1 }] });
```

```js
// skip
const { data, error } = await microgen.service('posts').find({ skip: 10 });
```

```js
// limit
const { data, error } = await microgen.service('posts').find({ limit: 10 });
```

```js
// select
const { data, error } = await microgen
  .service('posts')
  .find({ select: ['name'] });
```

```js
// lookup into multiple link to record fields
const { data, error } = await microgen
  .service('posts')
  .find({ lookup: ['categories'] });
```

```js
// lookup into all link to record fields
const { data, error } = await microgen.service('posts').find({ lookup: '*' });
```

```js
// lookup into all link to record fields but only show the ids
const { data, error } = await microgen
  .service('posts')
  .find({ lookup: { _id: '*' } });
```

```js
// lookup into all link to record fields and show all data
const { data, error } = await microgen
  .service('posts')
  .find({ lookup: { '*': '*' } });
```

```js
// where
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: 'Ega' } });
```

```js
// not equal
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: { $ne: 'Ega' } } });
```

```js
// contains
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: { $contains: 'Ega' } } });
```

```js
// not contains
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: { $notContains: 'Ega' } } });
```

```js
// include
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: { $in: ['Ega'] } } });
```

```js
// not include
const { data, error } = await microgen
  .service('posts')
  .find({ where: { name: { $nin: ['Ega'] } } });
```

```js
// less then
const { data, error } = await microgen
  .service('posts')
  .find({ where: { total: { $lt: 10 } } });
```

```js
// less then equal
const { data, error } = await microgen
  .service('posts')
  .find({ where: { total: { $lte: 10 } } });
```

```js
// greater then
const { data, error } = await microgen
  .service('posts')
  .find({ where: { total: { $gt: 10 } } });
```

```js
// greater then equal
const { data, error } = await microgen
  .service('posts')
  .find({ where: { total: { $gte: 10 } } });
```

### Count

```js
// count all records
const { data, error } = await microgen.service('posts').count();
```

```js
// count with filters
const { data, error } = await microgen
  .service('posts')
  .count({ filterKey: filterValue, ... });
```

## Storage

### Upload

```js
// from client
const file = event.target.files[0];
const { data, error } = await microgen.storage.upload(file);
```

```js
// from server
const file = req.files[0];
const { data, error } = await microgen.storage.upload(
  file.buffer,
  file.originalname,
);
```

## Realtime

### Event

- `*`
- `CREATE_RECORD`
- `UPDATE_RECORD`
- `DELETE_RECORD`
- `LINK_RECORD`
- `UNLINK_RECORD`

### Get `tableId` by Table Name

```js
const tableId = await microgen.realtime.getTableId('posts');

console.log(tableId);
```

### Subscribe

```js
microgen.realtime.subscribe(tableId, { event: '*' }, (message) => {
  if (message.error) {
    console.log(message.error);
    return;
  }

  console.log(message.event, message.payload);
});
```

### Unsubscribe

```js
microgen.realtime.unsubscribe(tableId);
```

## Field

### Find

```js
const { data, error } = await microgen.service('posts').field.find();
```

### Get

```js
const { data, error } = await microgen
  .service('posts')
  .field.getById('605a251d7b8678bf6811k3b1');
```

## CDN

You can now use plain `<script>`s to import microgen from CDNs, like:

```html
<script src="https://cdn.jsdelivr.net/npm/microgen-v3-sdk"></script>
```

Then you can use it from a global `microgen` variable:

```html
<script>
  const { createClient } = microgenV3;
  const client = createClient({
    apiKey: '*******************',
  });

  client
    .service('posts')
    .find()
    .then((res) => {
      if (res.error) {
        console.log(res.error);
        return;
      }

      console.log(res);
    });
</script>
```
