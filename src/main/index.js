import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {makeChannels} from'./others/communication.js';
import {db, sqlize} from './database/init-db.js';
import {protocolRegister, protocolFnSetter} from './others/protocol-maker.js';
import { openServer, closeServer } from './server/server.js';

const path = require('path');
const exePath = path.dirname(app.getPath('exe'));
// const isDev = process.env.IS_DEV == "true";

// ▼其它
if (!exePath) console.log('exe位置 =', exePath);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
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
        show: false,
        width: 1600,
        height: 900,
        autoHideMenuBar: false,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,   //允许渲染进程使用node.js
            contextIsolation: false, //允许渲染进程使用node.js
            // webSecurity: false, // 尝试
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
    });
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    console.log('==========');
    console.log('==========');
    console.log('==========');
    console.log(process.env['ELECTRON_RENDERER_URL']);
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    mainWindow.webContents.openDevTools(); // 打开控制台
    return mainWindow;
}

// ▼要放在 app.whenReady 之前执行，只能执行一次
protocolRegister();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // ▼加载调试插件
    var vueDevToolsPath = 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.5.0_0';
    session.defaultSession.loadExtension(vueDevToolsPath).then((name) => {
        console.log('加载插件- ok 🎉 ---------------')
    }).catch((err) => {
        console.log('加载插件 wrong 🎉----------------')
    });
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron');
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    });
    // ▼创建窗口
    const mainWindow = createWindow(); // 在此生成 toLog
    makeChannels(mainWindow);
    openServer();
    protocolFnSetter();
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        closeServer();
    }
});


// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// ▼ 在主进程中添加chrome的禁用同源策略的方法
// app.commandLine.appendSwitch("disable-site-isolation-trials");
// app.commandLine.appendSwitch('disable-web-security');

// // 允许 iframe 访问第三方url（有效性未知）
// mainWindow.webContents.session.webRequest.onHeadersReceived(
//     { urls: [ "*://*/*" ] },
//     (d, c) => {
//         if (d.responseHeaders['X-Frame-Options']) {
//             delete d.responseHeaders['X-Frame-Options'];
//         } else if(d.responseHeaders['x-frame-options']) {
//             delete d.responseHeaders['x-frame-options'];
//         }
//         c({cancel: false, responseHeaders: d.responseHeaders});
//     },
// );