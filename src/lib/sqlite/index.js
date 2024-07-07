const sqlite3 = require('sqlite3');

const { fromDB, toDB } = require('./utils/type-conversion');

let client;
let filename = '';

const mapType = (type) => {
  let mapped;
  switch (type) {
    case 'number':
      mapped = 'REAL';
      break;

    case 'string':
      mapped = 'TEXT';
      break;

    case 'bool':
      mapped = 'INTEGER';
      break;

    case 'date':
    case 'object':
      mapped = 'TEXT';
      break;

    default:
      throw new Error('Unmapped type');
  }

  return mapped;
};

// https://www.sqlitetutorial.net/sqlite-create-table/
// https://www.sqlitetutorial.net/sqlite-foreign-key/
// https://www.sqlitetutorial.net/sqlite-autoincrement/
// https://www.sqlitetutorial.net/sqlite-check-constraint/
// https://www.sqlitetutorial.net/sqlite-primary-key/
// https://www.sqlitetutorial.net/sqlite-index/
const createSql = ({ columns, name: tableName }) => {
  const sql = `
  CREATE TABLE IF NOT EXISTS "${tableName}" (
  ${columns.map(({
    name,
    type,
    required = false,
    default: defaultValue = null,
    unique = false,
  }) => (
    `
    ${name}
    ${mapType(type)}
    ${required === true ? 'NOT NULL' : ''}
    ${(defaultValue !== null) ? `DEFAULT ${defaultValue}` : ''}
    ${unique === true ? 'UNIQUE' : ''}`
  )).join(',')}
  )`;

  return sql;
};

const createIndexSql = (tableName, { columns, name, unique }) => (
  `CREATE ${unique ? 'UNIQUE' : ''} INDEX IF NOT EXISTS "${name}"
  ON "${tableName}" (${columns.join(', ')});`
);

const whereSql = (where) => {
  const params = Object.values(where);

  const sql = params.length
    ? `WHERE ${Object.keys(where).map((key) => `${key} = ?`).join(' AND ')}`
    : '';

  return { params, sql };
};

const valuesSql = (row) => {
  const params = Object.values(row);

  const sql = params.length
    ? `(${Object.keys(row).join(', ')}) VALUES (${params.map(() => '?').join(', ')})`
    : '';

  return { params, sql };
};

const setSql = (updates) => {
  const params = Object.values(updates);

  const sql = params.length
    ? `SET ${Object.keys(updates).map((key) => `${key} = ? `).join(', ')}`
    : '';

  return { params, sql };
};

const all = async (sql, params = []) => (
  new Promise((resolve, reject) => {
    client.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  })
);

const get = async (sql, params = []) => (
  new Promise((resolve, reject) => {
    client.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row || null);
    });
  })
);

const run = async (sql, params = []) => (
  new Promise((resolve, reject) => {
    // function to receive this
    client.run(sql, params, function callback(err) {
      if (err) reject(err);
      resolve(this);
    });
  })
);

const closeDB = async () => (
  new Promise((resolve, reject) => {
    client.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  })
);

const connectDB = async () => {
  client = await (
    new Promise((resolve, reject) => {
      const db = new sqlite3.Database(filename, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    })
  );
};

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

  return all(sql, [...params, limit, offset]);
};

const findOne = async (tableName, where) => {
  const { params, sql: wheresql } = whereSql(where);

  const sql = `SELECT * FROM "${tableName}" ${wheresql}`;

  return get(sql, params);
};

const initDB = async (initFilename = ':memory:') => {
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
  const allColums = await all(`SELECT name FROM PRAGMA_TABLE_INFO("${tableName}")`);
  const defaults = allColums.reduce((acc, { name }) => ({ ...acc, [name]: null }), {});
  const updates = { ...defaults, ...newRow };

  return updateOne(tableName, where, updates);
};

const dropTable = async (tableName) => run(`DROP TABLE "${tableName}"`);

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
  hasClient: () => !!client,
  initDB,
  insertOne,
  replaceOne,
  toDB,
  updateOne,
};
