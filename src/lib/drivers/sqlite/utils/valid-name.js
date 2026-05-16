const isAllowedTableAndFieldName = (name) => /[^"'`\\=]/iu.test(name);

const validate = (name) => {
  if (isAllowedTableAndFieldName(name)) {
    return name;
  }
  throw new Error('\'"`\\= are not allowed in table and filed names', name);
};

module.exports = validate;
