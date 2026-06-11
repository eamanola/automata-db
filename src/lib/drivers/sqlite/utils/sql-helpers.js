// https://www.sqlitetutorial.net/sqlite-create-table/
// https://www.sqlitetutorial.net/sqlite-foreign-key/
// https://www.sqlitetutorial.net/sqlite-autoincrement/
// https://www.sqlitetutorial.net/sqlite-check-constraint/
// https://www.sqlitetutorial.net/sqlite-primary-key/
// https://www.sqlitetutorial.net/sqlite-index/
const validateName = require('./valid-name');

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

const createIndexSql = (tableName, { columns, name, unique }) => (
  `CREATE ${unique ? 'UNIQUE' : ''} INDEX IF NOT EXISTS "${validateName(name)}"
  ON "${validateName(tableName)}"
  (${columns.map((columnName) => validateName(columnName)).join(', ')});`
);

const whereSql = (where) => {
  const params = Object.values(where);

  const sql = params.length
    ? `WHERE ${Object.keys(where).map((key) => `${validateName(key)} = ?`).join(' AND ')}`
    : '';

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

module.exports = {
  createIndexSql, createSql, setSql, valuesSql, whereSql,
};
