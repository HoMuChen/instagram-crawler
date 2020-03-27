const { program } = require('commander');

const Users = require('../services/Users');
const Medias = require('../services/Medias');
//const Locations = require('../services/Locations');

const queue = require('../components/queue');
const store = require('../components/store');
const source = require('../components/source');

program
  .command('users')
  .description('dispatch user related jobs to queues')
  .requiredOption('-n, --number <number>', 'dispatch how many user jobs')
  .option('-q, --queue <queue>',           'queue service to be used: redis | sqs | pub/sub', 'redis')
  .option('-s, --store <store>',           'store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .option('-ms, --meta-store <metaStore>', 'meta store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .action(async function(options){
    const number = Number(options.number);

    const users = new Users({
      metaStore: store.get(options.metaStore),
      store: store.get(options.store),
      queue: queue.get(options.queue),
      source,
    });
    const jobsCount = await users.dispatch(number);

    console.log(`[Dispatch] ${jobsCount} users to ${options.queue}`);

    process.exit(0);
  });

program
  .command('popular-users')
  .description('dispatch popular users jobs to queues based on fans_count')
  .requiredOption('-f, --from <from>',     'from how many fans_count')
  .requiredOption('-t, --to <to>',         'to how many fans_count')
  .option('-q, --queue <q>',               'queue service to be used: redis | sqs | pub/sub', 'redis')
  .option('-s, --store <s>',               'store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .option('-ms, --meta-store <metaStore>', 'meta store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .action(async function(options){
    const from = Number(options.from);
    const to = Number(options.to);

    const users = new Users({
      metaStore: store.get(options.metaStore),
      store: store.get(options.store),
      queue: queue.get(options.queue),
      source,
    });
    const jobsCount = await users.dispatchPopular(from, to);

    console.log(`[Dispatch] ${jobsCount} popular users to ${options.queue}`);

    process.exit(0);
  });

program
  .command('medias')
  .description('dispatch media codes jobs')
  .requiredOption('-n, --number <number>', 'dispatch how many user jobs')
  .option('-q, --queue <q>',               'queue service to be used: redis | sqs | pub/sub', 'redis')
  .option('-s, --store <s>',               'store service to be used: rethinkdb | dynamodb | firestore', 'rethinkdb')
  .option('-ms, --meta-store <metaStore>', 'meta store service to be used: rethinkdb | dynamodb | firestore', 'firestore')
  .action(async function(options){
    const number = Number(options.number);

    const medias = new Medias({
      metaStore: store.get(options.metaStore),
      store: store.get(options.store),
      queue: queue.get(options.queue),
      source,
    });
    const jobsCount = await medias.dispatch(number);

    console.log(`[Dispatch] ${jobsCount} medias to ${options.queue}`);

    process.exit(0);
  });

async function run() {
  await program.parseAsync()
}

run()
