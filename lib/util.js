/**
 *
 * @param  String char
 * @param  Integer length
 * @return String
 */
function padding(char, length) {
  return function(str) {
    return (Array(length).join(char) + str).slice(-length);
  }
}

function formatDate(date) {
  var pad = padding('0', 2)
  var d = [date.getFullYear(), pad(date.getMonth()), pad(date.getDay())].join(':')
  var h = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
  return [d, h].join(' ')
}

function length(obj, key) {
  return obj && obj[key] ? (obj[key] + '').length : 0
}

module.exports = {
  padding: padding,
  formatDate: formatDate,
  length: length
}
