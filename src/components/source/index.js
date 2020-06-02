const axios = require('axios');

const source = exports = module.exports = {};

source.dump = function dump(url, { proxy }) {
  return axios
    .get(url)
    .then(_ => _.data)
}

