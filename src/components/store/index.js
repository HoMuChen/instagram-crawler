const store = exports = module.exports = {};

store.get = function get(name) {
  if (name === 'rethinkdb') {
    return require('./rethinkdb');
  }
  if (name === 'dynamodb') {
    return require('./dynamodb');
  }
  if (name === 'firestore') {
    return require('./firestore');
  }

  console.log(`${name} store is not supported`);

  process.exit(1);
}
