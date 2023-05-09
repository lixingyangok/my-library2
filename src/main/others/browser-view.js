import { BrowserView } from 'electron';

let view = null;
const all_zero = { x: 0, y: 0, width: 0, height: 0 };

export default {
    preload(mainWindow){
        toLog('preload');
        view = new BrowserView();
        mainWindow.setBrowserView(view);
        view.setBounds(all_zero); //宽高设为0可以隐藏
        view.setAutoResize({
            width: true,
            height: true,
            vertical: true,
            horizontal: true,
        });
        // view.webContents.loadURL('');
    },
    show(mainWindow, oParams){
        toLog('show', oParams);
        if (!view) return;
        const obj = Object.keys(all_zero).reduce((oResult, key)=>{
            return {...oResult, [key]: oParams[key]}
        }, {});
        view.setBounds(obj);
        view.webContents.loadURL(oParams.url);
    },
    hide(mainWindow, oParams){
        toLog('hide', oParams);
        if (!view) return;
        // mainWindow.removeBrowserView(view); // 删除
        // browserView.webContents.insertCSS('html{display: none}') // 隐藏
        view.setBounds(all_zero); //宽高设为0可以隐藏
    },
};


