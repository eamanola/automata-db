const { AUTOMATA_DB_SQLITE_FILE } = require('../../config');
const { fromDB, toDB } = require('./utils/type-conversion');
const {
  createIndexSql, createSql, setSql, valuesSql, whereSql,
} = require('./utils/sql-helpers');
const {
  all, closeDB, connectDB, get, run,
} = require('./driver');

const count = async (client, tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `SELECT count(*) AS count FROM "${tableName}" ${wheresql}`;

  const { count: cc } = await get(client, sql, params);

  return cc;
};

const createIndexes = (client, { indexes = [], name: tableName }) => Promise.all(
  indexes.map((index) => run(client, createIndexSql(tableName, index))),
);

const createTable = async (client, table) => {
  await run(client, createSql(table));
  await createIndexes(client, table);

  // const indexes = await all('SELECT name, tbl_name FROM sqlite_master WHERE type = "index";');
  // console.log(indexes);
};

const deleteAll = async (client, tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `DELETE FROM "${tableName}" ${wheresql}`;

  return run(client, sql, params);
};

const deleteOne = async (client, tableName, where) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `
  DELETE FROM "${tableName}" WHERE rowid = (
    SELECT rowid FROM "${tableName}" ${wheresql} LIMIT 1
  )`;

  return run(client, sql, params);
};

const find = async (client, tableName, where, { limit = -1, offset = -1 }) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${tableName}" ${wheresql} LIMIT ? OFFSET ?`;

  return all(
    client,
    sql,
    [
      ...params,
      limit,
      offset,
    ],
  );
};

const findOne = async (client, tableName, where) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${tableName}" ${wheresql}`;

  return get(client, sql, params);
};

const insertOne = async (client, tableName, row) => {
  const { sql: valuessql, params } = valuesSql(row);

  const sql = `INSERT INTO "${tableName}" ${valuessql}`;
  return run(client, sql, params);
};

const updateOne = async (client, tableName, where, updates) => {
  const { sql: wheresql, params: whereParams } = whereSql(where);
  const { sql: setsql, params: setParams } = setSql(updates);

  const sql = `
  UPDATE "${tableName}" ${setsql} WHERE rowid = (
    SELECT rowid FROM "${tableName}" ${wheresql} LIMIT 1
  )`;

  return run(client, sql, [...setParams, ...whereParams]);
};

// TODO: deprecate
const replaceOne = async (client, tableName, where, newRow) => {
  const allColums = await all(client, `SELECT name FROM PRAGMA_TABLE_INFO('${tableName}')`);
  const defaults = allColums.reduce((acc, { name }) => ({ ...acc, [name]: null }), {});
  const updates = { ...defaults, ...newRow };

  return updateOne(client, tableName, where, updates);
};

const dropTable = async (client, tableName) => run(client, `DROP TABLE "${tableName}"`);

module.exports = {
  closeDB,
  connectDB: (filename = AUTOMATA_DB_SQLITE_FILE) => connectDB(filename),
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
};
