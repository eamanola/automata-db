const { fromDB, toDB } = require('./utils/type-conversion');
const { createIndexSql, createSql, statement } = require('./utils/sql-helpers');
const { closeDB, connectDB } = require('./driver');
const validateName = require('./utils/valid-name');

const count = (client, tableName, where = {}) => {
  const { count: cc } = statement(client)
    .select('count(*)')
    .as('count')
    .from(tableName)
    .where(where)
    .get();

  return cc;
};

const createTable = (client, table) => {
  const exec = client.transaction(() => {
    statement(client, { sql: createSql(table) }).run();

    table.indexes?.forEach(
      (index) => { statement(client, { sql: createIndexSql(table.name, index) }).run(); },
    );
  });

  return exec();
};

const deleteAll = (client, tableName, where = {}) => statement(client)
  .delete()
  .from(tableName)
  .where(where)
  .run();

const deleteOne = (client, tableName, where = {}) => {
  const rowIdStment = Object.keys(where).length > 0
    ? statement()
      .select('rowid')
      .from(tableName)
      .where(where)
      .limit(1)
    : null;

  statement(client)
    .delete()
    .from(tableName)
    .where(rowIdStment ? { rowId: rowIdStment } : {})
    .limit(1)
    .run();
};

const dropIndex = (client, indexName) => statement(client)
  .drop(indexName, { type: 'INDEX' })
  .run();

const dropTable = (client, tableName) => statement(client)
  .drop(tableName)
  .run();

const find = (client, tableName, where, { limit = -1, offset = -1 }) => statement(client)
  .select('*')
  .from(tableName)
  .where(where)
  .limit(limit)
  .offset(offset)
  .all();

const findOne = (client, tableName, where) => statement(client)
  .select('*')
  .from(tableName)
  .where(where)
  .limit(1)
  .get();

const insert = (client, tableName, rows) => {
  const exec = client.transaction(() => {
    const columns = statement(client, { sql: `PRAGMA table_info("${validateName(tableName)}");` })
      .all().map(({ name }) => name);

    return statement(client)
      .insert(tableName, columns, rows)
      .run();
  });

  return exec();
};

const insertOne = (client, tableName, row) => insert(client, tableName, [row]);

const updateOne = (client, tableName, where, updates) => {
  const rowIdStment = Object.keys(where).length > 0
    ? statement()
      .select('rowid')
      .from(tableName)
      .where(where)
      .limit(1)
    : null;

  statement(client)
    .update(tableName)
    .set(updates)
    .where(rowIdStment ? { rowId: rowIdStment } : {})
    .limit(1)
    .run();
};

// prone to insert (many) buggy condition
const update = (client, tableName, wheres, updates) => {
  const exec = client.transaction(() => {
    for (let i = 0; i < wheres.length; i += 1) {
      updateOne(client, tableName, wheres[i], updates[i]);
    }
  });

  return exec();
};

module.exports = {
  closeDB,
  connectDB,
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropIndex,
  dropTable,
  find,
  findOne,
  fromDB,
  insert,
  insertOne,
  toDB,
  update,
  updateOne,
};
