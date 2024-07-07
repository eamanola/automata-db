const validTableSchema = () => ({
  columns: [
    { name: 'bool', type: 'bool' },
    { name: 'date', type: 'date' },
    { name: 'object', type: 'object' },
    { name: 'number', type: 'number' },
    { name: 'required', required: true, type: 'string' },
    { name: 'string', type: 'string' },
  ],
  indexes: [
    { columns: ['bool', 'required'], name: 'bool-required', unique: true },
    { columns: ['required'], name: 'required', unique: true },
  ],
  name: 'table-name',
});

module.exports = {
  validTableSchema,
};
