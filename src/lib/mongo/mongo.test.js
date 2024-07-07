const { MongoClient } = require('mongodb');

const {
  initDB,
  connectDB,
  closeDB,
  deleteAll,
  count,
  insertOne,
} = require('.');

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

describe('connection', () => {
  describe('connectDB', () => {
    it('should connect', async () => {
      await initDB();
      await connectDB();

      await deleteAll('collection');
      expect(await count('collection')).toBe(0);
      await insertOne('collection', { foo: 'bar' });
      expect(await count('collection')).toBe(1);

      await closeDB();
    });
  });

  describe('closeDB', () => {
    it('should disconnect', async () => {
      await initDB();
      await connectDB();

      await deleteAll('collection');
      expect(await count('collection')).toBe(0);

      await closeDB();

      count('collection')
        .catch(({ name }) => expect(name).toMatch('MongoNotConnectedError'));
    });
  });
});
