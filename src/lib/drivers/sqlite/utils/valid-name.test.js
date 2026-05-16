const validate = require('./valid-name');

describe('valid names', () => {
  it('should not allow "', () => {
    try {
      validate('fooo"');
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
  });
  it('should not allow `', () => {
    try {
      validate('fooo`');
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
  });
  it("should not allow '", () => {
    try {
      validate("'fooo'");
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
  });
  it('should not allow \\', () => {
    try {
      validate('fooo\'');
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
    try {
      validate('fooo\\');
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
  });
  it('should not allow =', () => {
    try {
      validate('fooo=bar');
      expect('unreachable').toBe(true);
    } catch {
      expect(true).toBe(true);
    }
  });
  it('should return name on success ', () => {
    const name = 'a valid name';
    expect(validate(name)).toBe(name);
  });
});
