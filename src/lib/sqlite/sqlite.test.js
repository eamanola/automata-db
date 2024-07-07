const sqlite3 = require('sqlite3');

const { tableSchema } = require('../validators');

const {
  initDB,
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
    const client = new sqlite3.Database(':memory:');
    expect(typeof client.run).toBe('function');
    expect(typeof client.get).toBe('function');
    expect(typeof client.all).toBe('function');
    expect(typeof client.close).toBe('function');

    client.close();
  });
});

describe('connection', () => {
  describe('connectDB', () => {
    it('should connect', async () => {
      await initDB(':memory:');
      await connectDB();

      await createTable(table);
      await dropTable(table.name);

      await closeDB();
    });
  });

  describe('closeDB', () => {
    it('should disconnect', async () => {
      await initDB(':memory:');
      await connectDB();

      await createTable(table);
      await dropTable(table.name);

      await closeDB();

      try {
        await createTable(table);
      } catch ({ message }) {
        expect(/SQLITE_MISUSE: Database is closed/u.test(message)).toBe(true);
      }
    });
  });
});

describe('lastID', () => {
  it('is not unique', async () => {
    await initDB(':memory:');
    await connectDB();
    await createTable(table);

    await deleteAll(table.name);
    expect(await count(table.name)).toBe(0);
    const { lastID: firstId } = await insertOne(table.name, { foo: 1 });

    await deleteAll(table.name);
    expect(await count(table.name)).toBe(0);
    const { lastID: secondId } = await insertOne(table.name, { foo: 1 });

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).toBe(secondId);

    await dropTable(table.name);
    await closeDB();
  });
});
