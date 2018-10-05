const request = require('request')
const qs = require('querystring')

const config = require('../rabbitmq_config')

function get_token() {
  var str = [config.username, config.password].join(":")
  return new Buffer(str).toString("base64")
}

function get_host() {
  return [config.host, config.port].join(":")
}

function queues(params, cb) {
  var token = ["Basic", get_token()].join(" ")
  var host = get_host()
  request({
    url: 'http://' + host + '/api/queues?' + qs.stringify(params),
    method: 'GET',
    headers: {
      authorization: token
    },
    json: true
  }, function(err, resp, body) {
    if (err) {
      return cb(err)
    }
    if (resp && resp.statusCode == 200) {
      return cb(null, body)
    }
    return cb(body)
  })
}

module.exports = {
  queues: queues
}
