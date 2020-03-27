function Medias({ metaStore ,store, queue, source }) {
  this.domain = 'https://instagram.com';
  this.status = {
    'FAILED': -1,
    'WAIT': 0,
    'PARSED': 1,
  }

  this.metaStore = metaStore;
  this.store = store;
  this.queue = queue;
  this.source = source;
}

Medias.prototype.dispatch = async function(number, options) {
  const medias = await this.getWaitingMedias(number);

  await this.queue.add('gcp-media', medias);

  return medias.length;
}

Medias.prototype.getWaitingMedias = async function(number) { console.log(this.metaStore)
  const medias = await this.metaStore.getByIndex({
    table: 'IG.mediaCodes',
    index: 'status',
    values: this.status['WAIT'],
    size: number,
  });

  return medias;
}


Medias.prototype.parse = async function(id, username, options) {
  const url = `${this.domain}/${username}`;
  const html = this.source.dump(url);

  const { media, user } = this.htmlParser(html);

  return { media, user };
}

Medias.prototype.htmlParser = function(html) {

}

module.exports = Medias;
