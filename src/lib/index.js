const { tableSchema } = require('./validators');
const yupFromTable = require('./utils/yup-from-table');
const mongo = require('./mongo');
const sqlite = require('./sqlite');

module.exports = ({ DB_ENGINE = 'sqlite' } = {}) => {
  let driver;
  switch (DB_ENGINE.toLowerCase()) {
    case 'mongo':
      driver = mongo;
      break;

    case 'sqlite':
      driver = sqlite;
      break;

    default:
      throw new Error('DB_ENGINE should be one of: mongo, sqlite (default)');
  }

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
  } = driver;

  return {
    client: null,
    closeDB: async () => closeDB(this.client),
    connectDB: async (url) => {
      this.client = await connectDB(url);

      return this.client;
    },
    count: (tableName, where = {}) => count(this.client, tableName, where),
    createTable: async (table) => {
      await tableSchema.validate(table);

      await createTable(this.client, table);
    },
    deleteAll: (tableName, where = {}) => deleteAll(this.client, tableName, where),
    deleteOne: async (tableName, where = {}) => deleteOne(this.client, tableName, where),
    dropTable: (tableName) => dropTable(this.client, tableName),
    find: async (tableName, where = {}, { limit, offset } = {}) => (
      find(this.client, tableName, where, {
        limit: /^\d+$/u.test(limit) ? limit : undefined,
        offset: /^\d+$/u.test(offset) ? offset : undefined,
      })
    ),
    findOne: async (tableName, where) => findOne(this.client, tableName, where),
    fromDB: (row, columns) => fromDB(row, columns),
    insertOne: async (tableName, row) => insertOne(this.client, tableName, row),
    // TODO deprecate, use update instead;
    replaceOne: async (tableName, where, newRow) => (
      replaceOne(this.client, tableName, where, newRow)
    ),
    toDB: (obj) => toDB(obj),
    updateOne: async (tableName, where, updates, options = {}) => (
      updateOne(this.client, tableName, where, updates, options)
    ),
    yupFromTable,
  };
};
