const program = require('commander');

const Medias = require('../services/Medias');

const queue = require('../components/queue');
const store = require('../components/store');
const source = require('../components/source');

program
  .command('medias')
  .description('medias worker')
  .option('-c, --concurrency <c>', 'worker concurrency, default: 1', 1)
  .option('-q, --queue <q>',       'queue service to be used: redis | sqs | pub/sub', 'redis')
  .option('-s, --store <s>',       'store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .option('-ms, --meta-store <ms>','metadata store service to be used: rethinkdb | dynamodb | firestore', 'firestore')
  .action(function(options){
    const concurrency = options.concurrency;

    const medias = new Medias({
      metaStore: store.get(options.metaStore),
      store: store.get(options.store),
      queue: queue.get(options.queue),
      source: source, 
    });

    medias.runWorkers(concurrency, medias.parseCode.bind(medias));
  });

program.parse()
