const async = require('async');
const _ = require('underscore');
const colors = require('colors');

const util = require('./lib/util')
const cacheUtil = require('./lib/cache')
const config = require('./rabbitmq_config')
const api = require('./lib/api')

function map(info) {
  return _.chain(info).result('items').map(function(item) {
    return _.pick(item, 'name', 'state', 'messages', 'messages_unacknowledged', 'messages_ready')
  }).value()
}

function monitor(params, callback) {
  var params = {
    page:1,
    page_size: 100,
    name: '',
    use_regex: false,
    pagination: true,
  }

  async.auto({
    one: function(done) {
      api.queues(params, done)
    },
    pagination: ['one', function(result, done) {
      var info = result.one
      async.timesSeries(info.page_count, function(n, next) {
        if (n === 0) {
          return next(null, map(info))
        }
        params.page = n + 1
        api.queues(params, function(err, info) {
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
  var MAX_NUM = 10
  callback(null, _.chain(datas).filter(function(data) {return data.messages != 0}).sortBy('messages').each(function(msg, messages) {
    var cache = {}

    var cache_key = [msg.name, 'messages'].join('.')
    cacheUtil.circle(MAX_NUM, cache_key, msg['messages'])
    var values = cacheUtil.get(cache_key)
    var prev = values[0], isWarning = false
    for (var i = 1; i < values.length; i++) {
      if (values[i] >= prev) {
        prev = values[i]
      } else {
        isWarning = true
        break;
      }
    }
    if (!isWarning && values.length >= MAX_NUM) {
      console.log(colors.red(msg.name + ' 最近' + MAX_NUM + '次的消息总数:' + values.join(',') + ' 可能存在堵的风险'))
    }

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
    monitor({}, function(err, result) {
      if (err) {
        console.log('err:', err)
      }
      setTimeout(m, 10 * 1000)
    })
}

m()

// console.log(new Buffer('gisi_prd:gisi2016').toString('base64'))
