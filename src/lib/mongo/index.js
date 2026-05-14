const { MongoClient } = require('mongodb');

const copyDoc = (doc) => {
  if (!doc) return doc;

  return { ...doc };
};

const removeMongoId = (doc) => {
  if (!doc) return doc;

  const { _id, ...rest } = doc;
  return { ...rest };
};

const connectDB = (url) => {
  const client = new MongoClient(url);
  return client;
};

const findOne = async (client, collection, filter) => removeMongoId(
  await client
    .db()
    .collection(collection)
    .findOne(copyDoc(filter)),
);

const insertOne = async (client, collection, doc) => client
  .db()
  .collection(collection)
  .insertOne(copyDoc(doc));

const replaceOne = (client, collection, filter, replacement) => client
  .db()
  .collection(collection)
  .replaceOne(copyDoc(filter), copyDoc(replacement));

const deleteOne = (client, collection, filter) => client
  .db()
  .collection(collection)
  .deleteOne(copyDoc(filter));

const find = (client, collection, filter, { limit = 0, offset = 0 }) => client
  .db()
  .collection(collection)
  .find(copyDoc(filter), { limit, skip: offset })
  .map((doc) => removeMongoId(doc))
  .toArray();

const updateOne = (client, collection, filter, updates, options) => client
  .db()
  .collection(collection)
  .updateOne(copyDoc(filter), { $set: updates }, options);

// const upsert = (collection, filter, updates) => (
//  updateOne(collection, filter, updates, { upsert: true })
// );

const deleteAll = (client, collection, filter) => client
  .db()
  .collection(collection)
  .deleteMany(copyDoc(filter));

const count = (client, collection, filter) => client
  .db()
  .collection(collection)
  .countDocuments(copyDoc(filter));

// https://mongodb.github.io/node-mongodb-native/6.8/classes/Db.html#createCollection
// https://mongodb.github.io/node-mongodb-native/6.8/classes/Collection.html#createIndexes
const createTable = () => null;
// https://mongodb.github.io/node-mongodb-native/6.8/classes/Db.html#dropCollection
const dropTable = () => null;
module.exports = {
  closeDB: (client) => client.close(),
  connectDB,
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropTable,
  find,
  findOne,
  fromDB: (row) => row,
  insertOne,
  replaceOne,
  toDB: (obj) => obj,
  updateOne,
  // upsert,
};
