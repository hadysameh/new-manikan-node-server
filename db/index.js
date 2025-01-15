const fs = require('fs');
const dbFiltPath = __dirname + '/store.json';

const getDbJson = () => {
  const fileContent = fs.readFileSync(dbFiltPath, 'utf-8');
  let db = {};
  try {
    db = JSON.parse(fileContent);
  } catch (ok) {}
  return db;
};

const get = (key) => {
  let db = getDbJson();
  return db[key];
};

const set = (key, value) => {
  let db = getDbJson();
  db[key] = value;
  fs.writeFileSync('./store.json', JSON.stringify(db));
};

const remove = (key) => {
  let db = getDbJson();
  delete db[key];
  fs.writeFileSync('./store.json', JSON.stringify(db));
};

module.exports = { get, set, remove };
