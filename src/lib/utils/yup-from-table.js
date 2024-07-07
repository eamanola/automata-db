const {
  bool,
  number,
  object,
  string,
  date,
} = require('yup');

const { tableSchema } = require('../validators');

const yupFromTable = async ({ columns, name: tableName }) => {
  await tableSchema.validate({ columns, name: tableName });

  return object().shape(
    columns.reduce((
      acc,
      { name, required, type },
    ) => {
      let validator;

      switch (type) {
        case 'string':
          validator = string();
          break;

        case 'number':
          validator = number();
          break;

        case 'bool':
          validator = bool();
          break;

        case 'date':
          validator = date();
          break;

        case 'object':
          validator = object();
          break;

        default:
          throw new Error('unsupported type');
      }

      if (required) {
        validator = validator.required();
      } else {
        validator = validator.nullable();
      }

      return { ...acc, [name]: validator };
    }, {}),
  ).noUnknown().strict();
};

module.exports = yupFromTable;
