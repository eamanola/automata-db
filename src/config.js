require('dotenv').config();

const {
  AUTOMATA_DB_ENGINE = 'sqlite',
  AUTOMATA_DB_MONGO_TEST_URL = 'use-mongodb-memory-server',
  AUTOMATA_DB_MONGO_URL,
  NODE_ENV,
} = process.env;

if (!['mongo', 'sqlite'].includes((AUTOMATA_DB_ENGINE || '').toLowerCase())) {
  throw new Error('DB_ENGINE should be one of: mongo, sqlite (default)');
}
module.exports = {
  AUTOMATA_DB_ENGINE: AUTOMATA_DB_ENGINE.toLowerCase(),
  AUTOMATA_MONGO_URL: NODE_ENV === 'test' ? AUTOMATA_DB_MONGO_TEST_URL : AUTOMATA_DB_MONGO_URL,
  NODE_ENV,
};
