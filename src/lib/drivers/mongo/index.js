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

const closeDB = async (client, { mongod }) => {
  // mongodb-memory-server
  if (mongod) { await mongod.stop(); }

  return client.close();
};

const connectDB = async (url) => {
  let uri = url;
  let mongod = null;

  if (uri === ':memory:') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  const client = new MongoClient(uri);
  return { client, state: { mongod } };
};

const findOne = async (client, collection, filter) => removeMongoId(
  await client
    .db()
    .collection(collection)
    .findOne(copyDoc(filter)),
);

const insert = (client, collection, docs) => client
  .db()
  .collection(collection)
  .insertMany(docs.map((doc) => copyDoc(doc)));

const insertOne = async (client, collection, doc) => client
  .db()
  .collection(collection)
  .insertOne(copyDoc(doc));

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

const update = (client, collection, filters, updates, options) => (
  Promise.all(
    filters.map((filter, index) => updateOne(client, collection, filter, updates[index], options)),
  )
);

// needs replicas
// const session = await client.startSession();
// try {
//   await session.withTransaction(async () => {
//     for (let i = 0; i < filters.length; i += 1) {
//       await updateOne(client, collection, filters[i], updates[i], { ...options, session });
//     }
//   });
// } catch (err) {
//   console.log(err);
// } finally {
//   await session.endSession();
// }

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
  closeDB,
  connectDB,
  count,
  createTable,
  deleteAll,
  deleteOne,
  dropTable,
  find,
  findOne,
  fromDB: (row) => row,
  insert,
  insertOne,
  toDB: (obj) => obj,
  update,
  updateOne,
};
