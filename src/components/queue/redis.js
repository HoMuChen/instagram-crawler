const util = require('util');
const kue = require('kue');

const redisConfig = {
  host:   process.env['REDIS_HOST'],
  port:   process.env['REDIS_PORT'],
};

  const queue = kue.createQueue({
    jobEvents: false,
    redis: { ...redisConfig },
  });

function addOne(key, doc) {
  return new Promise((resolve, reject) => {
    queue.create(key, doc).save((err) => {
      if(err) reject( err );
      resolve('done');
    });
  })
}

function add(key, docs) {
  return Array.isArray(docs)
    ? Promise.all(
        docs.map(doc => addOne(key, doc))
      )
    : addOne(key, docs);
}


module.exports = {
 add,
}
