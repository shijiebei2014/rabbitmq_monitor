const colors = require('colors')
const cacheUtil = require('../cache')

const MAX_NUM = 15

module.exports = function(msg) {
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
    var message = msg.name + ' 最近' + MAX_NUM + '次的消息总数:' + values.join(',') + ' 可能存在堵的风险'
    console.log(colors.red(message))
    return message
  }
}
