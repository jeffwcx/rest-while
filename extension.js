let { window, workspace, Disposable, StatusBarAlignment, commands } = require('vscode');

const EXTENSIONNAME = "rest";

class RestController {

    constructor() {
        let subscriptions = [];
        this.initConfig();
        this._startTime = this._getCurrentTime(); // 编辑器开始启动的时间
        this._lastTime = this._startTime; // 当前时间
        this._nowTime = this._lastTime; // 上一次触发的时间
        this._continueTime = 0;
        this._nextTime = this._codingTime; // 预计下次提醒时间

        this._statusItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);

        window.onDidChangeTextEditorSelection(this.onPopTips, this, subscriptions);
        window.onDidChangeActiveTextEditor(this.onPopTips, this, subscriptions);
        this._disposable = Disposable.from(...subscriptions);
        
    }

    changeStatusBarItem(minutes) {
        if(!this._statusItem) {
            this._statusItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
        }
        this._statusItem.text = `编程时长 ${minutes} 分钟`;
        this._statusItem.show();
    }

    popTips(minutes) {
        let hours = Math.floor(minutes/60);
        minutes = minutes % 60;
        let tmp = hours === 0 ? "" : (hours+"小时");
        window.showWarningMessage(`你已经编程超过${tmp}${minutes}分钟! 休息一会吧!`);
    }

    onPopTips() {

        this._lastTime = this._nowTime;
        this._nowTime = this._getCurrentTime();
        if(this._nowTime - this._lastTime >= this._deadTime ) {
            this._startTime = this._nowTime;
            this._nextTime = this._codingTime;
            this._continueTime = 0;
            return;
        }
        this._continueTime = this._nowTime - this._startTime;
        let minutes = this._reverseTime(this._continueTime, false);
        this.changeStatusBarItem(minutes);
        if(this._continueTime >= this._nextTime) {
            this._nextTime += this._codingTime;
            this.popTips(minutes);
            
        }
    }
    getContinueTime() {
        this._lastTime = this._nowTime;
        this._nowTime = this._getCurrentTime();
        this._continueTime = this._nowTime - this._startTime;
        return this._continueTime;
    }
    _getConfigTime(value) {
        return this._reverseTime(this._config.get(value));
    }
    // 时间转换，true是分钟转毫秒，false是毫秒转分
    _reverseTime(time, to) {
        if(to || to === undefined) {
            return time*60000;
        } else {
            return Math.floor(time/60000);
        }
    }

    initConfig() {
        this._config = workspace.getConfiguration(EXTENSIONNAME);
        if(!this._config) return;
        this._codingTime = this._getConfigTime("codingTime");
        if(!this._codingTime) return;
        this._deadTime = this._getConfigTime("deadTime");
        if(!this._deadTime) return;
    }

    _getCurrentTime() {
        return new Date().getTime();
    }

    dispose() {
        this._disposable.dispose();
    }

}


function activate(context) {
    let controller = new RestController();
    // 用户配置更改时，初始化控制器的配置
    workspace.onDidChangeConfiguration(()=>
        controller.initConfig());
    context.subscriptions.push(controller, 
    commands.registerCommand('rest.showActiveTime', function(){
        let m = controller._reverseTime(controller.getContinueTime(), false);
        window.showInformationMessage(`当前编程时长为: ${m}分钟`);
    }));
}
exports.activate = activate;

function deactivate() {

}
exports.deactivate = deactivate;