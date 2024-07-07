const { validTableSchema } = require('../../../jest/test-helpers');

const yupFromTable = require('./yup-from-table');

const valid = {
  bool: true,
  date: new Date(),
  number: 1,
  object: { foo: 1 },
  required: 'required',
  string: 'string',
};

describe('yup from table', () => {
  let validator;

  beforeAll(async () => {
    validator = await yupFromTable(validTableSchema());
  });

  it('should pass valid', async () => {
    await validator.validate(valid);
    expect(true).toBe(true);
  });

  describe('types', () => {
    it('should validate number', async () => {
      try {
        await validator.validate({ ...valid, number: '1' });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/must be a `number`/u.test(message)).toBe(true);
      }
    });

    it('should validate string', async () => {
      try {
        await validator.validate({ ...valid, string: 1 });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/must be a `string`/u.test(message)).toBe(true);
      }
    });

    it('should validate bool', async () => {
      try {
        await validator.validate({ ...valid, bool: 'true' });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/must be a `boolean`/u.test(message)).toBe(true);
      }
    });

    it('should validate date', async () => {
      try {
        await validator.validate({ ...valid, date: 'ddsa' });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/must be a `date`/u.test(message)).toBe(true);
      }
    });

    it('should validate object', async () => {
      try {
        await validator.validate({ ...valid, object: 'foo' });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/must be a `object`/u.test(message)).toBe(true);
      }
    });
  });

  describe('required', () => {
    it('should validate required', async () => {
      try {
        const { required, ...rest } = valid;
        await validator.validate({ ...rest });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/is a required field/u.test(message)).toBe(true);
      }
    });

    it('should all null on not required required', async () => {
      await validator.validate({ ...valid, string: null });
      await validator.validate({ ...valid, number: null });
      await validator.validate({ ...valid, bool: null });
      try {
        await validator.validate({ ...valid, required: null });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/is a required field/u.test(message)).toBe(true);
      }
    });
  });

  describe('unknowns', () => {
    it('should not allow unknowns', async () => {
      try {
        await validator.validate({ ...valid, foo: 1 });
        expect(true).toBe(false);
      } catch ({ message }) {
        expect(/has unspecified keys/u.test(message)).toBe(true);
      }
    });
  });
});
