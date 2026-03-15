const Sqlite3 = require('better-sqlite3');

let client;
const connectDB = async (filename) => {
  client = new Sqlite3(filename);
};

const all = (sql, params = []) => {
  const rows = client.prepare(sql).all(...params);
  return rows;
};

const get = (sql, params = []) => {
  const row = client.prepare(sql).get(...params);
  return row || null;
};

const run = (sql, params = []) => {
  const info = client.prepare(sql).run(...params);
  return info;
};

const closeDB = () => {
  client.close();
};

const hasClient = () => !!client;

module.exports = {
  all, closeDB, connectDB, get, hasClient, run,
};
