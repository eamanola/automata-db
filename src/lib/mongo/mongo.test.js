const { MongoClient } = require('mongodb');

const {
  connectDB,
  closeDB,
  deleteAll,
  count,
  insertOne,
} = require('.');
const { AUTOMATA_DB_ENGINE } = require('../../config');

describe('API', () => {
  it('MongoClient should have used API', async () => {
    const client = new MongoClient('mongodb://foo');
    expect(typeof client.connect).toBe('function');
    expect(typeof client.close).toBe('function');
    expect(typeof client.db).toBe('function');
    expect(typeof client.db().collection).toBe('function');
    expect(typeof client.db().collection('collection').deleteMany).toBe('function');
    expect(typeof client.db().collection('collection').insertOne).toBe('function');
    expect(typeof client.db().collection('collection').countDocuments).toBe('function');
    expect(typeof client.db().collection('collection').findOne).toBe('function');
    expect(typeof client.db().collection('collection').replaceOne).toBe('function');
    expect(typeof client.db().collection('collection').deleteOne).toBe('function');
    expect(typeof client.db().collection('collection').find).toBe('function');
    expect(typeof client.db().collection('collection').updateOne).toBe('function');
  });
});

if (AUTOMATA_DB_ENGINE === 'mongo') {
  describe('connection', () => {
    describe('connectDB', () => {
      it('should connect', async () => {
        const client = await connectDB();

        await deleteAll(client, 'collection');
        expect(await count(client, 'collection')).toBe(0);
        await insertOne(client, 'collection', { foo: 'bar' });
        expect(await count(client, 'collection')).toBe(1);

        await closeDB(client);
      });
    });

    describe('closeDB', () => {
      it('should disconnect', async () => {
        const client = await connectDB();

        await deleteAll(client, 'collection');
        expect(await count(client, 'collection')).toBe(0);

        await closeDB(client);

        count(client, 'collection')
          .catch(({ name }) => expect(name).toMatch('MongoNotConnectedError'));
      });
    });
  });
}
