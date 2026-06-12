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
      const { client } = await connectDB(':memory:');

      await createTable(client, table);
      await dropTable(client, table.name);

      await closeDB(client);
    });
  });

  describe('closeDB', () => {
    it('should disconnect', async () => {
      const { client } = await connectDB(':memory:');

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
    const { client } = await connectDB(':memory:');
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

describe('indexes', () => {
  // sql: `SELECT * FROM sqlite_master WHERE type = 'index'`,
  // PRAGMA INDEX_LIST('${table.name}')
  it('should create unique/not', async () => {
    const { client } = await connectDB(':memory:');

    const index = {
      columns: [table.columns[0].name],
      name: `idx-${table.name}-${table.columns[0].name}`,
      unique: false,
    };
    const indexUnique = {
      columns: [table.columns[0].name],
      name: `idx-${table.name}-${table.columns[0].name}2`,
      unique: true,
    };
    const indexes = [index, indexUnique];

    expect(client.prepare(`PRAGMA INDEX_LIST('${table.name}')`).all().length).toBe(0);

    await createTable(client, { ...table, indexes });

    const results = client.prepare(`PRAGMA INDEX_LIST('${table.name}')`).all();

    expect(results.length).toBe(2);
    expect(results.some(({ name, unique }) => name === index.name && !unique)).toBe(true);
    expect(results.some(({ name, unique }) => name === indexUnique.name && unique)).toBe(true);

    await client.prepare(`DROP INDEX '${index.name}'`).run();
    await client.prepare(`DROP INDEX '${indexUnique.name}'`).run();
    await dropTable(client, table.name);
    await closeDB(client);
  });
  it('should create on several columns', async () => {
    const { client } = await connectDB(':memory:');

    const col1 = { name: 'foo', type: 'string' };
    const col2 = { name: 'bar', type: 'string' };
    const columns = [col1, col2];

    const indexes = [{
      columns: columns.map(({ name }) => name),
      name: `idx-${table.name}-${columns.map(({ name }) => name).join('-')}`,
    }];

    expect(client.prepare(`PRAGMA INDEX_LIST('${table.name}')`).all().length).toBe(0);

    await createTable(client, { ...table, columns, indexes });

    const results = client.prepare(`PRAGMA INDEX_LIST('${table.name}')`).all();
    expect(results.length).toBe(indexes.length);
    expect(results.some(({ name }) => name === indexes[0].name)).toBe(true);

    await client.prepare(`DROP INDEX '${indexes[0].name}'`).run();
    await dropTable(client, table.name);
    await closeDB(client);
  });
});
