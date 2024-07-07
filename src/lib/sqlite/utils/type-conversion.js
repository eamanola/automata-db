const supportedTypes = [
  'bool',
  'date',
  'number',
  'object',
  'string',
];

const skip = (obj) => [null/* , undefined */].includes(obj) || (typeof obj !== 'object');

const fromDB = (row, columns) => {
  if (skip(row)) {
    return row;
  }

  const obj = Object.keys(row).reduce((acc, key) => {
    let value;

    if (row[key] === null) {
      value = null;
    } else {
      const { type } = columns.find(({ name }) => name === key);
      switch (type) {
        case 'string':
          value = String(row[key]);
          break;

        case 'number':
          value = Number(row[key]);
          break;

        case 'bool':
          value = Number(row[key]) === 1;
          break;

        case 'date':
          value = new Date(row[key]);
          break;

        case 'object':
          value = JSON.parse(row[key]);
          break;

        default:
          throw new Error('Unsupported type');
      }
    }

    return { ...acc, [key]: value };
  }, {});

  return obj;
};

const toDB = (obj) => {
  if (skip(obj)) {
    return obj;
  }

  const row = Object.keys(obj).reduce((acc, key) => {
    let value;

    if (obj[key] === null) {
      value = null;
    } else {
      const type = typeof obj[key];
      switch (type) {
        case 'string':
        case 'number':
          value = obj[key];
          break;

        case 'boolean':
          value = obj[key] ? 1 : 0;
          break;

        case 'object':
          if (obj[key] instanceof Date) {
            value = obj[key].toISOString();
          } else {
            value = JSON.stringify(obj[key]);
          }
          break;

        default:
          throw new Error('Unsupported type');
      }
    }

    return { ...acc, [key]: value };
  }, {});

  return row;
};

module.exports = {
  fromDB,
  supportedTypes,
  toDB,
};
