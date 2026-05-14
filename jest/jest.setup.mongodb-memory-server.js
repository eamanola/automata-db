jest.mock('../src/lib/mongo', () => {
  const { MongoMemoryServer } = jest.requireActual('mongodb-memory-server');
  const mongo = jest.requireActual('../src/lib/mongo');
  let mongod = null;

  const connectDB = async (url) => {
    if (url === ':memory:') {
      mongod = await MongoMemoryServer.create();
      return mongo.connectDB(mongod.getUri());
    }

    return mongo.connectDB(url);
  };

  const closeDB = async (client) => {
    await mongo.closeDB(client);

    if (mongod) {
      await mongod.stop();
    }
  };

  return {
    ...mongo,
    closeDB,
    connectDB,
  };
});
