const { tableSchema } = require('../validators');

module.exports = ({ DB_ENGINE = 'sqlite' } = {}) => {
  let driver;
  switch (DB_ENGINE.toLowerCase()) {
    case 'mongo':
      driver = require('./mongo');
      break;

    case 'sqlite':
      driver = require('./sqlite');
      break;

    default:
      throw new Error('DB_ENGINE should be one of: mongo, sqlite (default)');
  }

  return {
    client: null,
    closeDB: async () => driver.closeDB(this.client, this.state),
    connectDB: async (url) => {
      const { client, state } = await driver.connectDB(url);

      this.client = client;
      this.state = state;

      return this.client;
    },
    count: (tableName, where = {}) => driver.count(this.client, tableName, where),
    createTable: async (table) => {
      await tableSchema.validate(table);

      await driver.createTable(this.client, table);
    },
    deleteAll: (tableName, where = {}) => driver.deleteAll(this.client, tableName, where),
    deleteOne: async (tableName, where = {}) => driver.deleteOne(this.client, tableName, where),
    dropTable: (tableName) => driver.dropTable(this.client, tableName),
    find: async (tableName, where = {}, { limit, offset } = {}) => (
      driver.find(this.client, tableName, where, {
        limit: /^\d+$/u.test(limit) ? limit : undefined,
        offset: /^\d+$/u.test(offset) ? offset : undefined,
      })
    ),
    findOne: async (tableName, where) => driver.findOne(this.client, tableName, where),
    fromDB: (row, columns) => driver.fromDB(row, columns),
    insert: async (tableName, rows) => driver.insert(this.client, tableName, rows),
    insertOne: async (tableName, row) => driver.insertOne(this.client, tableName, row),
    state: null,
    toDB: (obj) => driver.toDB(obj),
    update: async (tableName, wheres, updates, options = {}) => (
      driver.update(this.client, tableName, wheres, updates, options)
    ),
    updateOne: async (tableName, where, updates, options = {}) => (
      driver.updateOne(this.client, tableName, where, updates, options)
    ),
  };
};
