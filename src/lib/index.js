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
  insertOne,
  replaceOne,
  toDB,
  updateOne,
} = USE_MONGO ? mongo : sqlite;

const callbacks = [];

module.exports = {
  closeDB: async (client) => closeDB(client),
  connectDB: async () => {
    const client = await connectDB();
    await Promise.all(callbacks.map((callback) => callback()));

    callbacks.length = 0;
    return client;
  },
  count: (client, tableName, where = {}) => count(client, tableName, where),
  createTable: async (client, table) => {
    await tableSchema.validate(table);

    await createTable(client, table);
    // let it throw, and handle
    // if (hasClient()) {
    //   await createTable(client, table);
    // } else {
    //   callbacks.push(() => createTable(client, table));
    // }
  },
  deleteAll: (client, tableName, where = {}) => deleteAll(client, tableName, where),
  deleteOne: async (client, tableName, where = {}) => deleteOne(client, tableName, where),
  dropTable: (client, tableName) => dropTable(client, tableName),
  find: async (client, tableName, where = {}, { limit, offset } = {}) => (
    find(client, tableName, where, {
      limit: /^\d+$/u.test(limit) ? limit : undefined,
      offset: /^\d+$/u.test(offset) ? offset : undefined,
    })
  ),
  findOne: async (client, tableName, where) => findOne(client, tableName, where),
  fromDB: (row, columns) => fromDB(row, columns),
  insertOne: async (client, tableName, row) => insertOne(client, tableName, row),
  // TODO deprecate, use update instead;
  replaceOne: async (client, tableName, where, newRow) => (
    replaceOne(client, tableName, where, newRow)
  ),
  toDB: (obj) => toDB(obj),
  updateOne: async (client, tableName, where, updates, options = {}) => (
    updateOne(client, tableName, where, updates, options)
  ),
  yupFromTable,
};
