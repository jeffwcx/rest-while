const { getCurrentDate, getCurrentTime }  =  require('./utils')
const _ = require('lodash')

let Store = {}

exports.setAll = function (state) {
  Store = state
  if (!Store.lastTime) {
    Store.lastTime = getCurrentTime()
  }
  if (!Store.records) {
    Store.records = {}
  }
}

exports.getAll = function () {
  return Store
}

exports.updateLastTime = function (currentTime, departure, path) {
  const lastTime = Store.lastTime
  Store.lastTime = currentTime
  const currentDate = getCurrentDate()
  const updateTarget =  ['records', currentDate, path, 'acTime']
  if (!_.has(Store, updateTarget)) {
    _.set(Store, updateTarget, [0])
  }
  const interval = currentTime - lastTime
  const acTime = _.get(Store, updateTarget)
  if (interval > departure) {
    acTime.push(0)
  } else {
    acTime[acTime.length - 1] += interval
  }
}

exports.getAcTime = function () {
  const currentDate = getCurrentDate()
  const getTarget = ['records', currentDate]
  let result = 0
  if (_.has(Store, getTarget)) {
    const map = _.get(Store, getTarget)
    const dirs = Object.keys(map)
    result = dirs.reduce(function (sum, value) {
      const itemSum = map[value].acTime.reduce(function (s, item) {
        return s + item
      }, 0)
      return sum + itemSum
    }, result)
  }
  return result
}

exports.get = function (key) {
  return Store[key]
}

exports.set = function (key, value) {
  Store[key] = value
}
