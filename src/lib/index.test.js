const {
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropTable,
  find,
  findOne,
  insertOne,
  replaceOne,
  updateOne,
  connectDB,
  closeDB,
} = require('.');

const tableName = 'test';

const columns = [
  { name: 'foo', type: 'number' },
  { name: 'bar', type: 'number' },
  { default: 0, name: 'baz', type: 'number' },
];

const table = { columns, name: tableName };

let client;

describe('db test', () => {
  beforeAll(async () => {
    client = await connectDB();
    await createTable(client, table);
  });

  afterAll(async () => {
    await dropTable(client, tableName);
    await closeDB(client);
  });

  afterEach(() => deleteAll(client, tableName));

  describe('count', () => {
    it('should count all by default', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      expect(await count(client, tableName)).toBe(3);
    });

    it('should filter according to where', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      expect(await count(client, tableName, entry)).toBe(2);
    });
  });

  describe('deleteAll', () => {
    it('should delete all by default', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      await deleteAll(client, tableName);

      expect(await count(client, tableName)).toBe(0);
    });

    it('should filter according to where', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      await deleteAll(client, tableName, entry);

      expect(await count(client, tableName, entry)).toBe(0);
      expect(await count(client, tableName, { bar: 1 })).toBe(1);
    });
  });

  describe('deleteOne', () => {
    it('should delete one', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      await deleteOne(client, tableName);

      expect(await count(client, tableName, entry)).toBe(1);
    });

    it('should filter according to where', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      await deleteOne(client, tableName, { bar: 1 });

      expect(await count(client, tableName, entry)).toBe(2);
      expect(await count(client, tableName, { bar: 1 })).toBe(0);
    });

    it('should not delete multiple items', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      await deleteOne(client, tableName, entry);

      expect(await count(client, tableName, entry)).toBe(1);
    });

    it('should delete one without where', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      await deleteOne(client, tableName);

      expect(await count(client, tableName)).toBe(1);
    });
  });

  describe('find', () => {
    it('should find all by default', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      const entries = await find(client, tableName);

      expect(entries.length).toBe(3);
    });

    it('should filter according to where', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, { bar: 1 });

      const entries = await find(client, tableName, entry);

      expect(entries.length).toBe(2);
      entries.forEach((element) => {
        expect(element).toEqual(expect.objectContaining(entry));
      });
    });

    describe('optional params', () => {
      it('should accept optional limit', async () => {
        const entry = { foo: 1 };
        await insertOne(client, tableName, entry);
        await insertOne(client, tableName, entry);
        await insertOne(client, tableName, entry);

        const entries = await find(client, tableName, entry, { limit: 2 });

        expect(entries.length).toBe(2);
      });

      it('should accept optional offset', async () => {
        const entry = { foo: 1 };
        await insertOne(client, tableName, { ...entry, bar: 1 });
        await insertOne(client, tableName, { ...entry, bar: 2 });
        await insertOne(client, tableName, { ...entry, bar: 3 });

        const entries = await find(client, tableName, entry, { offset: 2 });

        expect(entries.length).toBe(1);
        expect(entries[0]).toEqual(expect.objectContaining({ ...entry, bar: 3 }));
      });

      it('and a combo of', async () => {
        const entry = { foo: 1 };
        await insertOne(client, tableName, { ...entry, bar: 1 });
        await insertOne(client, tableName, { ...entry, bar: 2 });
        await insertOne(client, tableName, { ...entry, bar: 3 });

        const entries = await find(client, tableName, entry, { limit: 1, offset: 1 });

        expect(entries.length).toBe(1);
        expect(entries[0]).toEqual(expect.objectContaining({ ...entry, bar: 2 }));
      });

      it('should ignore limit and offset, if invalid', async () => {
        const entry = { foo: 1 };
        await insertOne(client, tableName, { ...entry, bar: 1 });
        await insertOne(client, tableName, { ...entry, bar: 2 });
        await insertOne(client, tableName, { ...entry, bar: 3 });

        expect((await find(client, tableName, entry, { limit: 'foo' })).length).toBe(3);
        expect((await find(client, tableName, entry, { offset: 'foo' })).length).toBe(3);
        expect((await find(client, tableName, entry, { limit: null })).length).toBe(3);
        expect((await find(client, tableName, entry, { offset: null })).length).toBe(3);
        expect((await find(client, tableName, entry, { limit: undefined })).length).toBe(3);
        expect((await find(client, tableName, entry, { offset: undefined })).length).toBe(3);
        expect((await find(client, tableName, entry, { limit: -1 })).length).toBe(3);
        expect((await find(client, tableName, entry, { offset: -1 })).length).toBe(3);
      });
    });
  });

  describe('findOne', () => {
    it('should find one item', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);

      const result = await findOne(client, tableName, entry);
      expect(result).toEqual(expect.objectContaining(entry));
    });

    it('should retrun null, if not found', async () => {
      const nonExisting = await findOne(client, tableName, { foo: 1 });
      expect(nonExisting).toBe(null);
    });

    it('should not return multiple items', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      const result = await findOne(client, tableName, entry);
      expect(result).toEqual(expect.objectContaining(entry));
    });
  });

  describe('insertOne', () => {
    it('should save the new entry', async () => {
      const entry = { foo: 1 };
      expect(await count(client, tableName)).toBe(0);

      await insertOne(client, tableName, entry);

      expect(await count(client, tableName)).toBe(1);

      const inserted = await findOne(client, tableName, entry);
      expect(inserted).toEqual(expect.objectContaining(entry));
    });
  });

  describe('replaceOne', () => {
    it('should replace one item', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);

      await replaceOne(client, tableName, entry, { foo: 2 });

      expect(await findOne(client, tableName, { foo: 1 })).toBeFalsy();
      expect(await findOne(client, tableName, { foo: 2 })).toBeTruthy();

      expect(await count(client, tableName)).toBe(1);
    });

    it('should not partially update an entry', async () => {
      const entry = { bar: 1, baz: 1 };
      await insertOne(client, tableName, entry);

      await replaceOne(client, tableName, entry, { bar: 2 });

      const inserted = await findOne(client, tableName, { bar: 2 });
      expect(inserted.bar).toBe(2);
      expect(inserted.baz).toBeFalsy();
    });

    it('should not replace multiple items', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      await replaceOne(client, tableName, entry, { foo: 2 });

      expect(await count(client, tableName, { foo: 1 })).toBe(1);
      expect(await count(client, tableName, { foo: 2 })).toBe(1);
    });

    it('should not upsert', async () => {
      const nonExisting = { baz: 2 };
      const newRow = { bar: 2 };
      await replaceOne(client, tableName, nonExisting, newRow);

      expect(await findOne(client, tableName, newRow)).toBeFalsy();
    });
  });

  describe('updateOne', () => {
    it('should update one item', async () => {
      const entry = { bar: 1, foo: 1 };
      await insertOne(client, tableName, entry);

      await updateOne(client, tableName, entry, { foo: 2 });

      const inserted = await findOne(client, tableName, { bar: 1 });
      expect(inserted.foo).toBe(2);
    });

    it('should not update multiple items', async () => {
      const entry = { foo: 1 };
      await insertOne(client, tableName, entry);
      await insertOne(client, tableName, entry);

      await updateOne(client, tableName, entry, { foo: 2 });

      expect(await count(client, tableName, { foo: 1 })).toBe(1);
      expect(await count(client, tableName, { foo: 2 })).toBe(1);
    });

    it('should partially update an entry', async () => {
      const entry = { bar: 1, baz: 1 };
      await insertOne(client, tableName, entry);

      await updateOne(client, tableName, entry, { bar: 2 });

      const inserted = await findOne(client, tableName, { baz: 1 });
      expect(inserted.bar).toBe(2);
      expect(inserted.baz).toBe(1);
    });

    it('should not upsert', async () => {
      const nonExisting = { baz: 2 };
      const newRow = { bar: 2 };
      await updateOne(client, tableName, nonExisting, newRow);

      expect(await findOne(client, tableName, newRow)).toBeFalsy();
    });
  });
});
