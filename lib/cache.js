const kvo = require('kvo').kvo

var base = {}

function set(name, value) {
  kvo(base, name, value)
}

function get(name) {
  return kvo(base, name)
}

function del(name) {
  const bailRE = /[^\w.$]/

  if (bailRE.test(name)) {
    return
  }

  const segments = name.split('.')

  if (segments.length === 1) {
      base[name] = {}
  } else {
      kvo(base, segments.slice(0, segments.length - 1).join('.'), {})
  }
}

function clear() {
  base = {}
}

function union(name, value) {
  var prev = get(name)
  if (Object.prototype.toString.call(prev) !== "[object Array]") {
    if (["[object Undefined]", "[object Null]"].indexOf(Object.prototype.toString.call(prev)) === -1) {
      prev = [].concat(prev)
    } else {
      prev = []
    }
  }
  if (!~prev.indexOf(value)) {
    prev.push(value)
    kvo(base, name, prev)
  }
}

function circle(MAX_NUM, name, value) {
  var prev = get(name)
  if (Object.prototype.toString.call(prev) !== "[object Array]") {
    if (["[object Undefined]", "[object Null]"].indexOf(Object.prototype.toString.call(prev)) === -1) {
      prev = [].concat(prev)
    } else {
      prev = []
    }
  }
  prev.push(value)
  if (prev.length > MAX_NUM) {
    prev.splice(0, prev.length - MAX_NUM)
  }
  kvo(base, name, prev)
}

module.exports = {
  set: set,
  get: get,
  del: del,
  clear: clear,
  union: union,
  circle: circle
}
