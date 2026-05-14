require('dotenv').config({ quiet: true });

const {
  AUTOMATA_DB_MONGO_URL,
  AUTOMATA_DB_SQLITE_FILE,
  NODE_ENV,
} = process.env;

module.exports = {
  AUTOMATA_DB_MONGO_URL,
  AUTOMATA_DB_SQLITE_FILE,
  NODE_ENV,
};
