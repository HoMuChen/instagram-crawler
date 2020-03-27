const queue = exports = module.exports = {};

queue.get = function get(name) {
  if (name === 'redis') {
    return require('./redis');
  }

  if (name === 'sqs') {
    return {};
  }

  console.log(`${name} queue is not supported`);

  process.exit(1);
}
