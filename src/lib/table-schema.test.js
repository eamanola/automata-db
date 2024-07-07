const { validTableSchema } = require('../../jest/test-helpers');

const { supportedTypes: supportedSqliteTypes } = require('./sqlite/utils/type-conversion');

const { tableSchema } = require('./validators');

describe('table schema', () => {
  it('should pass valid', async () => {
    await tableSchema.validate(validTableSchema());
    expect(true).toBe(true);
  });

  it('should have a name', async () => {
    const { table, ...rest } = validTableSchema();

    try {
      await tableSchema.validate({ ...rest });
      expect(true).toBe(false);
    } catch (err) {
      expect(true).toBe(true);
    }
  });

  it('should have 1 column', async () => {
    const { columns, ...rest } = validTableSchema();

    try {
      await tableSchema.validate({ ...rest });
      expect(true).toBe(false);
    } catch (err) {
      expect(true).toBe(true);
    }

    try {
      await tableSchema.validate({ ...rest, columns: [] });
      expect(true).toBe(false);
    } catch (err) {
      expect(true).toBe(true);
    }

    try {
      await tableSchema.validate({ ...rest, columns: { foo: 1 } });
      expect(true).toBe(false);
    } catch (err) {
      expect(true).toBe(true);
    }

    try {
      await tableSchema.validate({ ...rest, columns: null });
      expect(true).toBe(false);
    } catch (err) {
      expect(true).toBe(true);
    }
  });

  describe('columns', () => {
    it('should have a name', async () => {
      const { columns, ...rest } = validTableSchema();

      const { name, ...restOfColumn } = columns[0];
      try {
        await tableSchema.validate({ ...rest, columns: [{ ...restOfColumn }] });
        expect(true).toBe(false);
      } catch (err) {
        expect(true).toBe(true);
      }
    });

    it('type should be supported', async () => {
      const { columns, ...rest } = validTableSchema();

      const { type, ...restOfColumn } = columns[0];

      const unsupported = 'foo';
      expect(
        supportedSqliteTypes.some((supportedType) => supportedType === unsupported),
      ).toBe(false);

      try {
        await tableSchema.validate({ ...rest, columns: [{ ...restOfColumn, type: unsupported }] });
        expect(true).toBe(false);
      } catch (err) {
        expect(true).toBe(true);
      }
    });
  });
});
