const { workspace, window } = require('vscode')

let target = {}

exports.init = function (locale) {
  try {
    target = require(`./${locale}.json`)
  } catch (error) {
    window.showErrorMessage('Locale config only support en or zh')
  }
}

exports.get = function (key, ...params) {
  const value = target[key]
  if (value) {
    return value.replace(/\{(0|[1-9][0-9]*)\}/g, function (match, p1) {
      return params[p1]
    })
  }
  return value
}
