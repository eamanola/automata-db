// https://www.sqlitetutorial.net/sqlite-create-table/
// https://www.sqlitetutorial.net/sqlite-foreign-key/
// https://www.sqlitetutorial.net/sqlite-autoincrement/
// https://www.sqlitetutorial.net/sqlite-check-constraint/
// https://www.sqlitetutorial.net/sqlite-primary-key/
// https://www.sqlitetutorial.net/sqlite-index/
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

module.exports = {
  createIndexSql, createSql, setSql, valuesSql, whereSql,
};
