jest.mock('../src/config', () => {
  const actual = jest.requireActual('../src/config');
  return {
    ...actual,
    AUTOMATA_DB_MONGO_URL: ':memory:',
    AUTOMATA_DB_SQLITE_FILE: ':memory:',
  };
});
