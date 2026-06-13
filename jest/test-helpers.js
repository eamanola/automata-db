const validTableSchema = () => ({
  columns: [
    { name: 'bool', type: Boolean },
    { name: 'date', type: Date },
    { name: 'object', type: Object },
    { name: 'number', type: Number },
    { name: 'required', required: true, type: String },
    { name: 'string', type: String },
  ],
  indexes: [
    {
      columns: ['bool', 'required'], name: 'bool-required', unique: true,
    },
    {
      columns: ['required'], name: 'required', unique: true,
    },
  ],
  name: 'table-name',
});

module.exports = {
  validTableSchema,
};
