const { AUTOMATA_DB_ENGINE, AUTOMATA_DB_MONGO_URL } = require('../src/config');

if (AUTOMATA_DB_ENGINE === 'mongo' && AUTOMATA_DB_MONGO_URL === ':memory:') {
  jest.mock('../src/lib/mongo', () => {
    const { MongoMemoryServer } = jest.requireActual('mongodb-memory-server');
    const mongo = jest.requireActual('../src/lib/mongo');
    let mongod;

    const initDB = async () => {
      mongod = await MongoMemoryServer.create();
      return mongo.initDB(mongod.getUri());
    };

    const closeDB = async () => {
      await mongo.closeDB();
      await mongod.stop();
    };

    return {
      ...mongo,
      closeDB,
      initDB,
    };
  });
}
