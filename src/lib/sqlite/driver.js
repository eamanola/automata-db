const Sqlite3 = require('better-sqlite3');

// let client;
const connectDB = async (filename) => {
  const client = new Sqlite3(filename);

  return client;
};

const all = (client, sql, params = []) => {
  const rows = client.prepare(sql).all(...params);
  return rows;
};

const get = (client, sql, params = []) => {
  const row = client.prepare(sql).get(...params);
  return row || null;
};

const run = (client, sql, params = []) => {
  const info = client.prepare(sql).run(...params);
  return info;
};

const closeDB = (client) => {
  client.close();
};

module.exports = {
  all, closeDB, connectDB, get, run,
};
