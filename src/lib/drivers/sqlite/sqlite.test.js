const Sqlite3 = require('better-sqlite3');

const { tableSchema } = require('../../validators');
const {
  connectDB,
  closeDB,
  createTable,
  insertOne,
  deleteAll,
  count,
  dropTable,
} = require('.');

const table = { columns: [{ name: 'foo', type: 'string' }], name: 'test-table' };

it('is valid table', async () => {
  await tableSchema.validate(table);
  expect(true).toBe(true);
});

describe('API', () => {
  it('sqlite3 should have used API', async () => {
    const client = new Sqlite3(':memory:');
    expect(typeof client.prepare).toBe('function');
    expect(typeof client.close).toBe('function');

    const prepare = client.prepare('SELECT 1');
    expect(typeof prepare.run).toBe('function');
    expect(typeof prepare.get).toBe('function');
    expect(typeof prepare.all).toBe('function');

    client.close();
  });
});

describe('connection', () => {
  describe('connectDB', () => {
    it('should connect', async () => {
      const client = await connectDB(':memory:');

      await createTable(client, table);
      await dropTable(client, table.name);

      await closeDB(client);
    });
  });

  describe('closeDB', () => {
    it('should disconnect', async () => {
      const client = await connectDB(':memory:');

      await createTable(client, table);
      await dropTable(client, table.name);

      await closeDB(client);

      try {
        await createTable(client, table);
      } catch ({ message }) {
        expect(/The database connection is not open/u.test(message)).toBe(true);
      }
    });
  });
});

describe('lastID', () => {
  it('is not unique', async () => {
    const client = await connectDB(':memory:');
    await createTable(client, table);

    await deleteAll(client, table.name);
    expect(await count(client, table.name)).toBe(0);
    const { lastInsertRowid: firstId } = await insertOne(client, table.name, { foo: 1 });

    await deleteAll(client, table.name);
    expect(await count(client, table.name)).toBe(0);
    const { lastInsertRowid: secondId } = await insertOne(client, table.name, { foo: 1 });

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).toBe(secondId);

    await dropTable(client, table.name);
    await closeDB(client);
  });
});
