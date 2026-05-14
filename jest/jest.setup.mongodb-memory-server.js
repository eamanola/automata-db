const { AUTOMATA_DB_MONGO_URL } = require('../src/config');

if (AUTOMATA_DB_MONGO_URL === ':memory:') {
  jest.mock('../src/lib/mongo', () => {
    const { MongoMemoryServer } = jest.requireActual('mongodb-memory-server');
    const mongo = jest.requireActual('../src/lib/mongo');
    let mongod;

    const connectDB = async () => {
      mongod = await MongoMemoryServer.create();
      return mongo.connectDB(mongod.getUri());
    };

    const closeDB = async (client) => {
      await mongo.closeDB(client);
      await mongod.stop();
    };

    return {
      ...mongo,
      closeDB,
      connectDB,
    };
  });
}
