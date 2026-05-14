const { tableSchema } = require('./validators');
const yupFromTable = require('./utils/yup-from-table');

module.exports = ({ DB_ENGINE = 'sqlite' } = {}) => {
  let driver;
  switch ((DB_ENGINE || '').toLowerCase()) {
    case 'mongo':
      driver = require('./mongo');
      break;

    case 'sqlite':
      driver = require('./sqlite');
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
    closeDB: async (client) => closeDB(client),
    connectDB: async (url) => {
      const client = await connectDB(url);

      return client;
    },
    count: (client, tableName, where = {}) => count(client, tableName, where),
    createTable: async (client, table) => {
      await tableSchema.validate(table);

      await createTable(client, table);
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
};
