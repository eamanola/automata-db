const { validTableSchema } = require('../../../../jest/test-helpers');

const { toDB, fromDB } = require('./type-conversion');

describe('sqlite type conversion', () => {
  it('should convert js types to db', async () => {
    const obj = {
      bool: true,
      date: new Date(),
      number: 1,
      object: { foo: 1 },
      string: 'string',
    };

    const row = toDB(obj);
    expect(typeof row.bool).toBe('number');
    expect(typeof row.date).toBe('string');
    expect(typeof row.number).toBe('number');
    expect(typeof row.object).toBe('string');
    expect(typeof row.string).toBe('string');
  });

  it('should convert db types to js', async () => {
    const { columns } = validTableSchema();
    const row = {
      bool: 0,
      date: (new Date()).toISOString(),
      number: 1,
      object: JSON.stringify({ foo: 1 }),
      string: 'string',
    };

    const obj = fromDB(row, columns);
    expect(typeof obj.bool).toBe('boolean');
    expect(typeof obj.date).toBe('object');
    expect(obj.date instanceof Date).toBe(true);
    expect(typeof obj.number).toBe('number');
    expect(typeof obj.object).toBe('object');
    expect(typeof obj.string).toBe('string');
  });

  it('should cancel eachother', () => {
    const { columns } = validTableSchema();
    const obj = {
      bool: false,
      date: new Date(),
      number: 1,
      object: { foo: 1 },
      string: 'string',
    };

    expect(fromDB(toDB(obj), columns)).toEqual(obj);
  });
});
