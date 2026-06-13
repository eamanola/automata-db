const { drivers } = require('.');

['sqlite', 'mongo'].forEach((DB_ENGINE) => {
  const db = drivers({ DB_ENGINE });

  const tableName = 'test';

  const columns = [
    { name: 'foo', type: Number },
    { name: 'bar', type: Number },
    { default: 0, name: 'baz', type: Number },
  ];

  const table = { columns, name: tableName };

  describe('db test', () => {
    beforeAll(async () => {
      await db.connectDB(':memory:');
      await db.createTable(table);
    });

    afterAll(async () => {
      await db.dropTable(tableName);
      await db.closeDB();
    });

    afterEach(() => db.deleteAll(tableName));

    describe('count', () => {
      it('should count all by default', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        expect(await db.count(tableName)).toBe(3);
      });

      it('should filter according to where', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        expect(await db.count(tableName, entry)).toBe(2);
      });
    });

    describe('deleteAll', () => {
      it('should delete all by default', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        await db.deleteAll(tableName);

        expect(await db.count(tableName)).toBe(0);
      });

      it('should filter according to where', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        await db.deleteAll(tableName, entry);

        expect(await db.count(tableName, entry)).toBe(0);
        expect(await db.count(tableName, { bar: 1 })).toBe(1);
      });
    });

    describe('deleteOne', () => {
      it('should delete one', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        await db.deleteOne(tableName);

        expect(await db.count(tableName, entry)).toBe(1);
      });

      it('should filter according to where', async () => {
        const entry = { foo: 12 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 13, foo: 12 });

        await db.deleteOne(tableName, { bar: 13, foo: 12 });

        expect(await db.count(tableName, entry)).toBe(2);
        expect(await db.count(tableName, { bar: 1 })).toBe(0);
      });

      it('should not delete multiple items', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        await db.deleteOne(tableName, entry);

        expect(await db.count(tableName, entry)).toBe(1);
      });

      it('should delete one without where', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        await db.deleteOne(tableName);

        expect(await db.count(tableName)).toBe(1);
      });
    });

    describe('find', () => {
      it('should find all by default', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        const entries = await db.find(tableName);

        expect(entries.length).toBe(3);
      });

      it('should filter according to where', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);
        await db.insertOne(tableName, { bar: 1 });

        const entries = await db.find(tableName, entry);

        expect(entries.length).toBe(2);
        entries.forEach((element) => {
          expect(element).toEqual(expect.objectContaining(entry));
        });
      });

      describe('optional params', () => {
        it('should accept optional limit', async () => {
          const entry = { foo: 1 };
          await db.insert(tableName, [entry, entry, entry]);

          const entries = await db.find(tableName, entry, { limit: 2 });

          expect(entries.length).toBe(2);
        });

        it('should accept optional offset', async () => {
          const entry = { foo: 1 };
          await db.insert(tableName, [
            { ...entry, bar: 1 },
            { ...entry, bar: 2 },
            { ...entry, bar: 3 },
          ]);

          const entries = await db.find(tableName, entry, { offset: 2 });

          expect(entries.length).toBe(1);
          expect(entries[0]).toEqual(expect.objectContaining({ ...entry, bar: 3 }));
        });

        it('and a combo of', async () => {
          const entry = { foo: 1 };
          await db.insert(tableName, [
            { ...entry, bar: 1 },
            { ...entry, bar: 2 },
            { ...entry, bar: 3 },
          ]);

          const entries = await db.find(tableName, entry, { limit: 1, offset: 1 });

          expect(entries.length).toBe(1);
          expect(entries[0]).toEqual(expect.objectContaining({ ...entry, bar: 2 }));
        });

        it('should ignore limit and offset, if invalid', async () => {
          const entry = { foo: 1 };
          await db.insert(tableName, [
            { ...entry, bar: 1 },
            { ...entry, bar: 2 },
            { ...entry, bar: 3 },
          ]);

          expect((await db.find(tableName, entry, { limit: 'foo' })).length).toBe(3);
          expect((await db.find(tableName, entry, { offset: 'foo' })).length).toBe(3);
          expect((await db.find(tableName, entry, { limit: null })).length).toBe(3);
          expect((await db.find(tableName, entry, { offset: null })).length).toBe(3);
          expect((await db.find(tableName, entry, { limit: undefined })).length).toBe(3);
          expect((await db.find(tableName, entry, { offset: undefined })).length).toBe(3);
          expect((await db.find(tableName, entry, { limit: -1 })).length).toBe(3);
          expect((await db.find(tableName, entry, { offset: -1 })).length).toBe(3);
        });
      });
    });

    describe('findOne', () => {
      it('should find one item', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        const result = await db.findOne(tableName, entry);
        expect(result).toEqual(expect.objectContaining(entry));
      });

      it('should retrun null, if not found', async () => {
        const nonExisting = await db.findOne(tableName, { foo: 1 });
        expect(nonExisting).toBe(null);
      });

      it('should not return multiple items', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        const result = await db.findOne(tableName, entry);
        expect(result).toEqual(expect.objectContaining(entry));
      });
    });

    describe('insert', () => {
      it('should save the new entries', async () => {
        const entry1 = { foo: 13 };
        const entry2 = { foo: 12 };

        expect(await db.count(tableName)).toBe(0);

        await db.insert(tableName, [entry1, entry2]);

        expect(await db.count(tableName)).toBe(2);

        const inserted1 = await db.findOne(tableName, entry1);
        expect(inserted1).toEqual(expect.objectContaining(entry1));

        const inserted2 = await db.findOne(tableName, entry2);
        expect(inserted2).toEqual(expect.objectContaining(entry2));
      });

      it('should insert different valid objects if objects not identical', async () => {
        const entries = [{ foo: 1 }, { bar: 2 }];
        await db.insert(tableName, entries);
        expect(await db.count(tableName)).toBe(2);

        const inserted1 = await db.findOne(tableName, entries[0]);
        expect(inserted1).toEqual(expect.objectContaining(entries[0]));

        const inserted2 = await db.findOne(tableName, entries[1]);
        expect(inserted2).toEqual(expect.objectContaining(entries[1]));
      });
    });

    describe('insertOne', () => {
      it('should save the new entry', async () => {
        const entry = { foo: 1 };
        expect(await db.count(tableName)).toBe(0);

        await db.insertOne(tableName, entry);

        expect(await db.count(tableName)).toBe(1);

        const inserted = await db.findOne(tableName, entry);
        expect(inserted).toEqual(expect.objectContaining(entry));
      });
    });

    describe('updateOne', () => {
      it('should update one item', async () => {
        const entry = { bar: 1, foo: 1 };
        await db.insertOne(tableName, entry);

        await db.updateOne(tableName, entry, { foo: 2 });

        const inserted = await db.findOne(tableName, { bar: 1 });
        expect(inserted.foo).toBe(2);
      });

      it('should not update multiple items', async () => {
        const entry = { foo: 1 };
        await db.insert(tableName, [entry, entry]);

        await db.updateOne(tableName, entry, { foo: 2 });

        expect(await db.count(tableName, { foo: 1 })).toBe(1);
        expect(await db.count(tableName, { foo: 2 })).toBe(1);
      });

      it('should partially update an entry', async () => {
        const entry = { bar: 1, baz: 1 };
        await db.insertOne(tableName, entry);

        await db.updateOne(tableName, entry, { bar: 2 });

        const inserted = await db.findOne(tableName, { baz: 1 });
        expect(inserted.bar).toBe(2);
        expect(inserted.baz).toBe(1);
      });

      it('should not upsert', async () => {
        const nonExisting = { baz: 2 };
        const newRow = { bar: 2 };
        await db.updateOne(tableName, nonExisting, newRow);

        expect(await db.findOne(tableName, newRow)).toBeFalsy();
      });
    });

    describe('update many', () => {
      it('it should update many', async () => {
        const entry1 = { bar: 1, foo: 1 };
        const entry2 = { bar: 2, foo: 2 };
        await db.insert(tableName, [entry1, entry2]);

        await db.update(tableName, [entry1, entry2], [{ foo: 11 }, { foo: 22 }]);

        const inserted1 = await db.findOne(tableName, { bar: 1 });
        const inserted2 = await db.findOne(tableName, { bar: 2 });

        expect(inserted1.foo).toBe(11);
        expect(inserted2.foo).toBe(22);
      });
    });
  });
});
