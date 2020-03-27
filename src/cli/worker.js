const program = require('commander');

program
  .command('worker-medias')
  .description('medias worker')
  .option('-c, --concurrency <c>', 'worker concurrency, default: 1', 1)
  .option('-q, --queue <q>',       'queue service to be used: redis | sqs | pub/sub', 'redis')
  .option('-s, --store <s>',       'store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .action(function(options){
    const concurrency = options.concurrency;
  });

