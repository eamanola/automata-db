const { AUTOMATA_DB_ENGINE } = require('../config');
const { tableSchema } = require('./validators');
const yupFromTable = require('./utils/yup-from-table');

// for production: hardcode to reduce build size & deps
const mongo = require('./mongo');
const sqlite = require('./sqlite');

const USE_MONGO = AUTOMATA_DB_ENGINE === 'mongo';

const {
  closeDB,
  connectDB,
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropTable,
  find,
  findOne,
  fromDB,
  initDB,
  insertOne,
  hasClient,
  replaceOne,
  toDB,
  updateOne,
} = USE_MONGO ? mongo : sqlite;

const callbacks = [];

module.exports = {
  closeDB: async () => closeDB(),
  connectDB: async () => {
    await connectDB();
    await Promise.all(callbacks.map((callback) => callback()));

    callbacks.length = 0;
  },
  count: (tableName, where = {}) => count(tableName, where),
  createTable: async (table) => {
    await tableSchema.validate(table);

    if (hasClient()) {
      await createTable(table);
    } else {
      callbacks.push(() => createTable(table));
    }
  },
  deleteAll: (tableName, where = {}) => deleteAll(tableName, where),
  deleteOne: async (tableName, where = {}) => deleteOne(tableName, where),
  dropTable: (tableName) => dropTable(tableName),
  find: async (tableName, where = {}, { limit, offset } = {}) => (
    find(tableName, where, {
      limit: /^\d+$/u.test(limit) ? limit : undefined,
      offset: /^\d+$/u.test(offset) ? offset : undefined,
    })
  ),
  findOne: async (tableName, where) => findOne(tableName, where),
  fromDB: (row, columns) => fromDB(row, columns),
  initDB: async (...args) => initDB(...args),
  insertOne: async (tableName, row) => insertOne(tableName, row),
  // TODO deprecate, use update instead;
  replaceOne: async (tableName, where, newRow) => replaceOne(tableName, where, newRow),
  toDB: (obj) => toDB(obj),
  updateOne: async (tableName, where, updates, options = {}) => (
    updateOne(tableName, where, updates, options)
  ),
  yupFromTable,
};
