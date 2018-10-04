const request = require('request')
const async = require('async');
const _ = require('underscore');
const qs = require('querystring')

const util = require('./lib/util')
const config = require('./rabbitmq_config')

function req(params, host, authorization, cb) {
  request({
    url: 'http://' + host + '/api/queues?' + qs.stringify(params),
    method: 'GET',
    headers: {
      authorization: authorization
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

function map(info) {
  return _.chain(info).result('items').map(function(item) {
    return _.pick(item, 'name', 'state', 'messages', 'messages_unacknowledged', 'messages_ready')
  }).value()
}

function monitor(params, callback) {
  var host = params.host,
      authorization = params.authorization;

  var params = {
    page:1,
    page_size: 100,
    name: '',
    use_regex: false,
    pagination: true,
  }

  async.auto({
    one: function(done) {
      req(params, host, authorization, done)
    },
    pagination: ['one', function(result, done) {
      var info = result.one
      async.timesSeries(info.page_count, function(n, next) {
        if (n === 0) {
          return next(null, map(info))
        }
        params.page = n + 1
        req(params, host, authorization, function(err, info) {
          if (err) {
            return next(null)
          }
          return next(null, map(info))
        })
      }, function(err, infos) {
        done(null, _.chain(infos).compact().flatten().value())
      })
    }]
  }, function(err, result) {
    if (err) {
      return callback(err)
    }
    analysis(result.pagination, callback)
  })
}

function analysis(datas, callback) {
  var now = util.formatDate(new Date())

  callback(null, _.chain(datas).filter(function(data) {return data.messages != 0}).sortBy('messages').each(function(msg, messages) {
    var cache = {}
    var rets = _.reduce(['name', 'state', 'messages', 'messages_unacknowledged', 'messages_ready'], function(mem, key) {
      if (!cache[key]) {
        cache[key] = util.length(_.max(messages, function(msg) {
          return util.length(msg, key)
        }), key)
      }
      mem.push(util.padding(' ', cache[key])(msg[key]))
      return mem
    }, [now])
    console.log(rets.join(' '));
  }).value())
}



console.log('时间\tname\tstate\tready\tunack\ttotal')
function m() {
    monitor({
      host: [config.host, config.port].join(':'),
      authorization: config.authorization
    }, function(err, result) {
      // console.log(err, result)
      setTimeout(m, 5 * 1000)
    })
}

m()
