import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {makeChannels} from'./others/communication.js';
import {db, sqlize} from './database/init-db.js';
import {protocolRegister, protocolFnSetter} from './others/protocol-maker.js';

const path = require('path');
// ▼自定义导入
// ▼其它声明
const isDev = process.env.IS_DEV == "true";
const exePath = path.dirname(app.getPath('exe'));

// ▼其它
if (!exePath) console.log('exe位置 =', exePath);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
global.toLog = () => null;
global.db = db;
global.sqlize = sqlize;
global.newPromise = function (){
    let fnResolve, fnReject;
    const oPromise = new Promise((f1, f2) => {
        fnResolve = f1, fnReject = f2;
    });
    return {oPromise, fnResolve, fnReject};
};

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        show: false,
        autoHideMenuBar: false,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration:true,   //允许渲染进程使用node.js
            contextIsolation:false, //允许渲染进程使用node.js
        }
    })
    global.toLog = (...rest) => {
        mainWindow.webContents.send('logInBrower', ...rest);
    };

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        toLog('❤️❤️❤️');
    })
    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    // mainWindow.webContents.openDevTools(); // 打开控制台
}

// ▼要放在 app.whenReady 之前执行，只能执行一次
protocolRegister();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })
    // ▼创建窗口
    createWindow(); // 在此生成 toLog
    makeChannels();
    protocolFnSetter();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
