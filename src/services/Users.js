function Users({ metaStore ,store, queue, source }) {
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

Users.prototype.dispatch = async function(number, options) {
  const users = await this._getWaitingUsers(number);

  await this.queue.add('user', users);

  return users.length;
}

Users.prototype.dispatchPopular = async function(from, to, options) {
  const users = await this._getPopularUsers(from, to);

  await this.queue.add('popular-user', users);

  return users.length;
}

Users.prototype._getWaitingUsers = async function(number) {
  const users = await this.metaStore.getByIndex({
    table: 'users_v2',
    index: 'info_status',
    values: this.status['WAIT'],
    fields: ['id', 'username'],
    size: number,
  });

  return users;
}

Users.prototype._getPopularUsers = async function(from, to) {
  const users = await this.metaStore.betweenByIndex({
    table: 'users_v2',
    index: 'fans_count',
    from: from,
    to: to,
    fields: ['id', 'username'],
  });

  return users;
}

Users.prototype.parse = async function(id, username, options) {
  const url = `${this.domain}/${username}`;
  const html = await this.source.dump(url, { proxy: options.proxy });

  const { user, codes } = this.htmlParser(html);

  return { user, codes };
}

Users.prototype.htmlParser = function(html) {

}

module.exports = Users;
