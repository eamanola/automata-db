const { initDB, connectDB, closeDB } = require('../src');

const SKIP_PATHS = [
  'src/lib/mongo/mongo.test.js',
  'src/lib/sqlite/sqlite.test.js',
];
const { testPath } = expect.getState();
const skip = () => SKIP_PATHS.some((skipPath) => testPath.includes(skipPath));

beforeAll(async () => {
  if (skip()) { return; }

  await initDB();
  await connectDB();
});

afterAll(async () => {
  if (skip()) { return; }

  await closeDB();
});
