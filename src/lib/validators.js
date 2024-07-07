const {
  array,
  bool,
  mixed,
  object,
  string,
} = require('yup');

const { supportedTypes: supportedSqliteTypes } = require('./sqlite/utils/type-conversion');

const columnSchema = object().shape({
  default: mixed(),
  name: string().required(),
  required: bool(),
  type: mixed().oneOf(supportedSqliteTypes).required(),
  unique: bool(),
}).noUnknown().strict();

const indexSchema = object().shape({
  columns: array().of(string()).required(),
  name: string().required(),
  unique: bool(),
}).noUnknown().strict();

const tableSchema = object().shape({
  columns: array().min(1).of(columnSchema).required(),
  indexes: array().of(indexSchema),
  name: string().required(),
}).noUnknown().strict();

module.exports = {
  tableSchema,
};
