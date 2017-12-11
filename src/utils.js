
/**
 * get current timestamp(ms)
 */
exports.getCurrentTime = function () {
  return Date.now()
}

/**
 * true minutes -> ms
 * false ms -> minutes
 */
exports.reverseTime = function (time, is) {
  if (is) return time * 60000
  return Math.floor(time / 60000)
}

/**
 * get current date
 */
exports.getCurrentDate = function () {
  const now = new Date()
  return '' + now.getFullYear() + (now.getMonth() + 1) + now.getDate()
}



