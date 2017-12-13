const { window, StatusBarAlignment, Disposable, workspace } = require('vscode')
const { get, set, updateLastTime, getAcTime } = require('./store')
const { getCurrentTime, reverseTime } = require('./utils')
const locale = require('./locale')

const EXTENSIONNAME = "rest"

class RestController {
  constructor () {
    this.initConfig()
    this.bindEvent()
    this.startTime = getCurrentTime()
    this.remindTime = this.startTime + this._interval
    this._getAllRootPath(workspace.workspaceFolders)
    this.statusItem = this._createStatusItem(4)
  }

  // init config
  initConfig () {
    this._config = workspace.getConfiguration(EXTENSIONNAME)
    if (!this._config) return
    this._interval = reverseTime(this._config.interval, true)
    if (!this._interval) return
    this._locale = this._config.locale
    locale.init(this._locale)
    if (!this._locale) return
    this._departure = reverseTime(this._config.departure, true)
    if (!this._departure) return
    this._isShowTips = this._config.isShowTips
  }

  /**
   * bind all events which trigger to update state
   */
  bindEvent () {
    let subscriptions = []
    window.onDidChangeTextEditorSelection(this.onUpdateState, this, subscriptions)
    window.onDidChangeActiveTextEditor(this.onUpdateState, this, subscriptions)
    this._disposable = Disposable.from(...subscriptions)
  }

  _getAllRootPath (workspaceFolders = []) {
    let folders = []
    workspaceFolders.forEach(function (folder) {
      folders.push(folder.uri.fsPath)
    })
    this.workspaceFolders = folders
  }
  _getCurrentRootPath (path) {
    let resultPath = path
    for (let i = 0; i < this.workspaceFolders.length; i += 1) {
      let nowPath = this.workspaceFolders[i]
      if (path.indexOf(nowPath) >= 0) {
        resultPath = nowPath
        break;
      }
    }
    return resultPath
  }

  _getCurrentPath (event) {
    let documentData = event.textEditor
    ? event.textEditor._documentData
    : event._documentData
    if (documentData) {
      return this._getCurrentRootPath(documentData._uri.fsPath)
    }
    return ''
  }
  /**
   * update extension state
   */
  onUpdateState (event) {
    if (!event) return
    const currentRoot = this._getCurrentPath(event)
    if (!currentRoot) return
    const lastTime = get('lastTime')
    const currentTime = getCurrentTime()
    updateLastTime(currentTime, this._departure, currentRoot)
    const accTime = getAcTime()
    let conTime
    if (currentTime - lastTime > this._departure) {
      this.startTime = currentTime
      this.remindTime = currentTime + this._interval
      conTime = 0
    } else {
      conTime = currentTime - this.startTime
      // remind user have a break
      if (currentTime >= this.remindTime && this._isShowTips) {
        this.remindTime = currentTime + this._interval
        this._showTips('Warning', conTime, 'tip')
      }
    }
    this._updateStatusItem(conTime, accTime)
  }

  _getContiuousTime () {
    const currentTime = getCurrentTime()
    const lastTime = get('lastTime')
    if (currentTime - lastTime > this._departure) {
      return 0
    } else {
      return currentTime - this.startTime
    }
  }
  showContinuousTime () {
    this._showTips('Information', this._getContiuousTime(), 'statusItemCon')
  }

  showAccumulatedTime () {
    this._showTips('Information', getAcTime(), 'statusItemAcc')
  }
  /**
   * dispose all the subscriptions
   */
  dispose () {
    this._disposable.dispose()
  }

  // show user a information message
  _showTips (type, timestamp, item) {
    const msg = locale.get(item, this._transformTime(timestamp))
    window[`show${type}Message`](msg)
  }

  // create a status bar item
  _createStatusItem (priority) {
    return window.createStatusBarItem(StatusBarAlignment.Left, priority)
  }

  // transform timestamp to user-friendly format
  _transformTime (timestamp) {
    const munit = locale.get('minutes')
    const hunit = locale.get('hours')
    const minutes = Math.floor(timestamp / 60000)
    let h = ''
    let hn = Math.floor(minutes / 60)
    let m = ''
    let mn = minutes % 60
    h = '' + hn + hunit + ' '
    if (hn === 0) h = ''
    m = '' + mn + munit
    if (hn !== 0 && mn === 0) m = ''
    if (hn === 0 && mn === 0) m = locale.get('less') + ' 1' + munit
    return h + m
  }
  // update status item
  _updateStatusItem (ctime, atime) {
    const aText = locale.get('statusItemAcc', this._transformTime(atime))
    const cText = locale.get('statusItemCon', this._transformTime(ctime))
    this.statusItem.text = `${cText}  ${aText}`
    this.statusItem.show()
  }
}


exports.RestController = RestController
