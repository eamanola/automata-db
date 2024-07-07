module.exports = {
  setupFilesAfterEnv: [
    './jest/jest.setup.mongodb-memory-server.js',
    './jest/jest.setup.db.js',
  ],
};
