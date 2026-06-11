const { fromDB, toDB } = require('./utils/type-conversion');
const {
  createIndexSql, createSql, setSql, valuesSql, whereSql,
} = require('./utils/sql-helpers');
const {
  all, closeDB, connectDB, get, run,
} = require('./driver');
const validateName = require('./utils/valid-name');

const count = (client, tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `SELECT count(*) AS count FROM "${validateName(tableName)}" ${wheresql}`;

  const { count: cc } = get(client, sql, params);

  return cc;
};

const createIndexes = (client, { indexes = [], name: tableName }) => Promise.all(
  indexes.map((index) => run(client, createIndexSql(tableName, index))),
);

const createTable = (client, table) => {
  run(client, createSql(table));
  createIndexes(client, table);

  // const indexes = all('SELECT name, tbl_name FROM sqlite_master WHERE type = "index";');
  // console.log(indexes);
};

const deleteAll = (client, tableName, where = {}) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `DELETE FROM "${validateName(tableName)}" ${wheresql}`;

  return run(client, sql, params);
};

const deleteOne = (client, tableName, where) => {
  const { sql: wheresql, params } = whereSql(where);

  const sql = `
  DELETE FROM "${validateName(tableName)}" WHERE rowid = (
    SELECT rowid FROM "${validateName(tableName)}" ${wheresql} LIMIT 1
  )`;

  return run(client, sql, params);
};

const dropTable = (client, tableName) => run(client, `DROP TABLE "${validateName(tableName)}"`);

const find = (client, tableName, where, { limit = -1, offset = -1 }) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${validateName(tableName)}" ${wheresql} LIMIT ? OFFSET ?`;

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

const findOne = (client, tableName, where) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${validateName(tableName)}" ${wheresql}`;

  return get(client, sql, params);
};

const insert = (client, tableName, rows) => {
  const keysStr = JSON.stringify(Object.keys(rows[0]).sort());
  if (rows.some((aRow) => JSON.stringify(Object.keys(aRow).sort()) !== keysStr)) {
    throw new Error(
      `Not implemented error:
rows must have identical keys. Use several calls, for different types of objects`,
    );
  }

  const { sql: valuessql, params } = valuesSql(rows);

  const sql = `INSERT INTO "${validateName(tableName)}" ${valuessql}`;

  return run(client, sql, params);
};

const insertOne = (client, tableName, row) => insert(client, tableName, [row]);

const updateOne = (client, tableName, where, updates) => {
  const { sql: wheresql, params: whereParams } = whereSql(where);
  const { sql: setsql, params: setParams } = setSql(updates);

  const sql = `
  UPDATE "${validateName(tableName)}" ${setsql} WHERE rowid = (
    SELECT rowid FROM "${validateName(tableName)}" ${wheresql} LIMIT 1
  ) LIMIT 1`;

  return run(client, sql, [...setParams, ...whereParams]);
};

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
