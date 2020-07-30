const cheerio = require('cheerio');
const { v5: uuid } = require('uuid');

const NAME_SPACE = process.env['UUID_NS'] || '91461c99-f89d-49d2-af96-d8e2e14e9b58';

function Medias({ metaStore ,store, queue, source }) {
  this.domain = 'https://instagram.com';
  this.status = {
    'FAILED': -1,
    'WAIT': 0,
    'PARSED': 1,
  };
  this.queueName = 'gcp-media';
  this.metaTable = 'IG.mediaCodes';
  this.namespace = NAME_SPACE;

  this.metaStore = metaStore;
  this.store = store;
  this.queue = queue;
  this.source = source;
}

Medias.prototype.dispatch = async function(number, options) {
  const medias = await this.getWaitingMedias(number);

  await this.queue.add(this.queueName, medias);

  return medias.length;
}

Medias.prototype.getWaitingMedias = async function(number) {
  const medias = await this.metaStore.getByIndex({
    table: this.metaTable,
    index: 'status',
    values: this.status['WAIT'],
    size: number,
  });

  return medias;
}

Medias.prototype.runWorkers = function(concurrency, func, options={}) {
  this.queue.consume(this.queueName, concurrency, (job, done) => {
    func(job.data)
      .then(_ => done())
  })
}

Medias.prototype.parseCode = async function({ id: code }) {
  const url = `${this.domain}/p/${code}`;
  console.log('[Info] Start to parse media: ', url);

  try {
    const html = await this.source.dump(url+'?__a=1', {});

    const { media, user, commentUsers } = this.htmlParser(html, url);

    await this.updateParsed(code);
    await this.store.upsert({ table: 'media', docs: media});
    await this.store.upsert({ table: 'users_v2', docs: user});
    await this.store.upsert({ table: 'users', docs: commentUsers});

    return 'done';
  } catch (e) {
    console.log('[Error] code: ', code, e.message);

    await this.updateFailed(code);

    return 'done'
  }
}

Medias.prototype.updateParsed = async function(code) {
  const doc = { id: code, status: this.status['PARSED'] };

  await this.metaStore.upsert({ table: this.metaTable, doc })
}

Medias.prototype.updateFailed = async function(code) {
  const doc = { id: code, status: this.status['FAILED'] };

  await this.metaStore.upsert({ table: this.metaTable, doc })
}

Medias.prototype.htmlParser = function(body, url) {
  const data = body.graphql.shortcode_media;

  const isHavingContent = data.edge_media_to_caption.edges.length > 0;
  const description = isHavingContent
    ? data.edge_media_to_caption.edges[0].node.text.replace(/#[-'\w\u4e00-\u9eff]+/g, "").trim()
    : ""
  const tagsText = isHavingContent
    ? data.edge_media_to_caption.edges[0].node.text.match(/#[-'\w\u4e00-\u9eff]+/g)
    : false
  const tags = tagsText? tagsText.map(x => x.split('#')[1]): []
  const image_url = data.display_url;
  const like_count = data.edge_media_preview_like.count;
  const comment_cout = data.edge_media_preview_comment.count;
  const location_id = data.location && data.location.id;
  const location_name = data.location && data.location.name;
  const owner_id = data.owner.id;
  const owner_username = data.owner.username;
  const owner_full_name = data.owner.full_name || "";
  const owner_profile_pic_url = data.owner.profile_pic_url;
  const owner_is_private = data.owner.is_private;
  const tm = data.taken_at_timestamp;
  const updated_at = Math.floor(Date.now()/1000);

  const media = {
    id: uuid(url, this.namespace),
    url,
    updated_at,
    tm,
    description,
    tags,
    image_url,
    like_count,
    comment_cout,
    location_id,
    location_name,
    owner_id,
    owner_username,
  };
  const user = {
    id: owner_id,
    username: owner_username,
    full_name: owner_full_name,
    profile_pic_url: owner_profile_pic_url,
    updated_at,
    info_status: 0,
  }
  const commentUsers = data.edge_media_preview_comment.edges.map(e => ({
    id: e.node.owner.id,
    username: e.node.owner.username,
    profile_pic_url: e.node.owner.profile_pic_url,
    updated_at,
    info_status: 0,
  }));

  return { media, user, commentUsers }
}

module.exports = Medias;
