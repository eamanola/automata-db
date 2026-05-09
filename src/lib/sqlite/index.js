const { AUTOMATA_DB_SQLITE_FILE } = require('../../config');
const { fromDB, toDB } = require('./utils/type-conversion');
const {
  createIndexSql, createSql, setSql, valuesSql, whereSql,
} = require('./utils/sql-helpers');
const {
  all, closeDB, connectDB, get, hasClient, run,
} = require('./driver');

const count = async (tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `SELECT count(*) AS count FROM "${tableName}" ${wheresql}`;

  const { count: cc } = await get(sql, params);

  return cc;
};

const createIndexes = ({ indexes = [], name: tableName }) => Promise.all(
  indexes.map((index) => run(createIndexSql(tableName, index))),
);

const createTable = async (table) => {
  await run(createSql(table));
  await createIndexes(table);

  // const indexes = await all('SELECT name, tbl_name FROM sqlite_master WHERE type = "index";');
  // console.log(indexes);
};

const deleteAll = async (tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `DELETE FROM "${tableName}" ${wheresql}`;

  return run(sql, params);
};

const deleteOne = async (tableName, where) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `
  DELETE FROM "${tableName}" WHERE rowid = (
    SELECT rowid FROM "${tableName}" ${wheresql} LIMIT 1
  )`;

  return run(sql, params);
};

const find = async (tableName, where, { limit = -1, offset = -1 }) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${tableName}" ${wheresql} LIMIT ? OFFSET ?`;

  return all(
    sql,
    [
      ...params,
      limit,
      offset,
    ],
  );
};

const findOne = async (tableName, where) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${tableName}" ${wheresql}`;

  return get(sql, params);
};

let filename = '';
const initDB = async (initFilename = AUTOMATA_DB_SQLITE_FILE) => {
  filename = initFilename;
};

const insertOne = async (tableName, row) => {
  const { sql: valuessql, params } = valuesSql(row);

  const sql = `INSERT INTO "${tableName}" ${valuessql}`;
  return run(sql, params);
};

const updateOne = async (tableName, where, updates) => {
  const { sql: wheresql, params: whereParams } = whereSql(where);
  const { sql: setsql, params: setParams } = setSql(updates);

  const sql = `
  UPDATE "${tableName}" ${setsql} WHERE rowid = (
    SELECT rowid FROM "${tableName}" ${wheresql} LIMIT 1
  )`;

  return run(sql, [...setParams, ...whereParams]);
};

// TODO: deprecate
const replaceOne = async (tableName, where, newRow) => {
  const allColums = await all(`SELECT name FROM PRAGMA_TABLE_INFO('${tableName}')`);
  const defaults = allColums.reduce((acc, { name }) => ({ ...acc, [name]: null }), {});
  const updates = { ...defaults, ...newRow };

  return updateOne(tableName, where, updates);
};

const dropTable = async (tableName) => run(`DROP TABLE "${tableName}"`);

module.exports = {
  closeDB,
  connectDB: () => connectDB(filename),
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropTable,
  find,
  findOne,
  fromDB,
  hasClient,
  initDB,
  insertOne,
  replaceOne,
  toDB,
  updateOne,
};
