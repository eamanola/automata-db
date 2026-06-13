// https://www.sqlitetutorial.net/sqlite-create-table/
// https://www.sqlitetutorial.net/sqlite-foreign-key/
// https://www.sqlitetutorial.net/sqlite-autoincrement/
// https://www.sqlitetutorial.net/sqlite-check-constraint/
// https://www.sqlitetutorial.net/sqlite-primary-key/
// https://www.sqlitetutorial.net/sqlite-index/
const validateName = require('./valid-name');
const { all, get, run } = require('../driver');

const mapType = (type) => {
  let mapped;
  switch (type) {
    case Number:
      mapped = 'REAL';
      break;

    case String:
      mapped = 'TEXT';
      break;

    case Boolean:
      mapped = 'INTEGER';
      break;

    case Date:
    case Object:
      mapped = 'TEXT';
      break;

    default:
      throw new Error('Unmapped type');
  }

  return mapped;
};

const createSql = ({ columns, name: tableName }) => {
  const sql = `
  CREATE TABLE IF NOT EXISTS "${validateName(tableName)}" (
  ${columns.map(({
    name,
    type,
    required = false,
    default: defaultValue = null,
    unique = false,
  }) => (
    `
    ${validateName(name)}
    ${mapType(type)}
    ${required === true ? 'NOT NULL' : ''}
    ${(defaultValue !== null) ? `DEFAULT ${validateName(defaultValue)}` : ''}
    ${unique === true ? 'UNIQUE' : ''}`
  )).join(',')}
  )`;

  return sql;
};

const createIndexSql = (tableName, { columns, name, unique }) => {
  const sql = `CREATE ${unique ? 'UNIQUE' : ''} INDEX IF NOT EXISTS "${validateName(name)}"
    ON "${validateName(tableName)}"
    (${columns.map((columnName) => validateName(columnName)).join(', ')});`;

  return sql;
};

const whereSql = (where) => {
  const keys = Object.keys(where);
  if (keys.length === 0) {
    return { params: [], sql: '' };
  }

  let params = [];

  const conditions = keys.map((key) => {
    const value = where[key];

    // TODO
    const isStatement = typeof value?.value === 'function';
    if (isStatement) {
      const { params: p, sql: s } = value.value();
      params = [...params, ...p];
      return `${validateName(key)} = ( ${s} )`;
    }

    params = [...params, value];
    return `${validateName(key)} = ( ? )`;
  });

  const sql = `WHERE ${conditions.join(' AND ')}`;
  return { params, sql };
};

const valuesSql = (columns, rows) => {
  const data = Array.isArray(rows) ? rows : [rows];

  const sql = `(${columns.join(', ')}) VALUES ${
    data.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ')}`;

  const params = data.reduce((final, row) => [
    ...final,
    ...columns.map((key) => row[key]),
  ], []);

  return { params, sql };
};

const setSql = (updates) => {
  const params = Object.values(updates);

  const sql = params.length
    ? `SET ${Object.keys(updates).map((key) => `${validateName(key)} = ?`).join(', ')}`
    : '';

  return { params, sql };
};

/* eslint-disable sort-keys */
const statement = (client = null, { params = [], sql = '' } = {}) => ({
  select: (columns) => {
    const s = `${sql} SELECT ${Array.isArray(columns) ? columns.join(', ') : columns}`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  delete: () => {
    const s = `${sql} DELETE`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  update: (tableName) => {
    const s = `${sql} UPDATE "${validateName(tableName)}"`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  insert: (tableName, columns, rows) => {
    const { sql: valuessql, params: valueParams } = valuesSql(columns, rows);

    const s = `${sql} INSERT INTO "${validateName(tableName)}" ${valuessql}`;
    const p = [...params, ...valueParams];

    return statement(client, { params: p, sql: s });
  },
  set: (updates) => {
    const { sql: setsql, params: setParams } = setSql(updates);

    const s = `${sql} ${setsql}`;
    const p = [...params, ...setParams];

    return statement(client, { params: p, sql: s });
  },
  // index or table name
  drop: (name, { type = 'TABLE' } = {}) => {
    const s = `${sql} DROP ${validateName(type)} "${validateName(name)}"`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  as: (alias) => {
    const s = `${sql} AS "${validateName(alias)}"`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  from: (tableName) => {
    const s = `${sql} FROM "${validateName(tableName)}"`;
    const p = [...params];

    return statement(client, { params: p, sql: s });
  },
  where: (where) => {
    const { sql: wheresql, params: whereParams } = whereSql(where);

    const s = `${sql} ${wheresql}`;
    const p = [...params, ...whereParams];

    return statement(client, { params: p, sql: s });
  },
  limit: (limit) => {
    const s = `${sql} LIMIT ?`;
    const p = [...params, limit];

    return statement(client, { params: p, sql: s });
  },
  offset: (offset) => {
    const s = `${sql} OFFSET ?`;
    const p = [...params, offset];

    return statement(client, { params: p, sql: s });
  },
  print: () => {
    console.log(`${sql.replace(/\s+/gu, ' ')};`, params);
    return statement(client, { params, sql });
  },
  value: () => ({ sql, params }),
  get: () => get(client, `${sql};`, params),
  run: () => run(client, `${sql};`, params),
  all: () => all(client, `${sql};`, params),
});

module.exports = {
  createIndexSql, createSql, statement,
};
