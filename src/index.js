const { RestController } = require('./controller')
const { setAll, getAll } = require('./store')
const { workspace, commands } = require('vscode')
const STOREKEY = 'rest'
let globalState

function activate (context) {
  const controller = new RestController()
  globalState = context.globalState
  const store = globalState.get(STOREKEY, {})
  setAll(store)
  // config will change when user update configuration
  workspace.onDidChangeConfiguration(() => controller.initConfig())
  context.subscriptions.push(controller,
    commands.registerCommand('rest.showContinuousTime', function () {
      controller.showContinuousTime()
    }),
    commands.registerCommand('rest.showAccumulatedTime', function () {
      controller.showAccumulatedTime()
    })
  )
}

function deactivate () {
  globalState.update(STOREKEY, getAll())
}

exports.activate = activate
exports.deactivate = deactivate
