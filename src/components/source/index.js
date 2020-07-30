const axios = require('axios');

const source = exports = module.exports = {};

const COOKIE = process.env['COOKIE'];

source.dump = function dump(url, { proxy, cookie=COOKIE }) {
  return axios({
    method: 'GET',
    url: url,
    headers: {
      cookie: cookie,
    }
  })
    .then(_ => _.data)
}
