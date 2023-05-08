/*
 * @Author: 李星阳
 * @Date: 2022-01-10 20:03:47
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-08 21:55:25
 * @Description: 
 */
import {doSql} from '../database/init-db.js';
import a1 from '../database/dev-history.js';
import a2 from '../database/media.js';
import a3 from '../database/line.js';
import a4 from '../database/dictionary.js';
import a5 from '../database/new-word.js';
import a6 from '../database/click-in-off.js';
import oBrowserViewFn from './browser-view.js';

const fsp = require('node:fs/promises');
const { ipcMain } = require('electron');
const hasher = require('hash-wasm');
const oDbFn = { // 所有的数据库方法
    ...a1,
    ...a2,
    ...a3,
    ...a4,
    ...a5,
    ...a6,
    doSql,
};

export function makeChannels(mainWindow){
    // ▼接收一个测试消息
    ipcMain.on('channel01', (event, arg) => {
        toLog('收到窗口内容：\n', arg);
        // event.reply('fileSaverReply', err); // 示例
    });
    // ▼保存文本的方法
    ipcMain.handle("fileSaver", async (event, oData) => {
        const {sSaveTo, aChannelData_} = oData;
        const err = await fsp.writeFile(sSaveTo, aChannelData_).catch(
            err => err,
        );
        return err;
    });
    // 主进程
    ipcMain.handle("getHash", async (event, sPath) => {
        // console.time('读取文件 Buffer');
        const oBuffer = await fsp.readFile(sPath).catch(err=>{
            toLog('读文件出错\n', err);
        });
        if (!oBuffer) return;
        // console.timeEnd('读取文件 Buffer');
        // console.time('计算 Buffer指纹');
        const sHash = await hasher.xxhash64(oBuffer); // 56MB 一共耗时 60ms
        // console.timeEnd('计算 Buffer指纹');
        return sHash;
    });
    // 主进程
    ipcMain.handle("db", async (event, sFnName, oParams) => {
        const theFn = oDbFn[sFnName];
        if (!theFn) throw 'fnName is wrong';
        const res = await theFn(oParams);
        return res; 
    });
    // ▼处理子窗口相关事件
    ipcMain.handle("BrowserView", async (event, sAction, oParams) => {
        const theFn = oBrowserViewFn[sAction];
        if (!theFn) throw 'sAction is wrong';
        const res = await theFn(mainWindow, oParams);
        return res; 
    });
};


// console.log('盘符如下：');
// const {exec} = require('child_process');
// exec('wmic logicaldisk get name', function(error, stdout, stderr){
//     if (error || stderr) {
//         console.error(`查询盘符出错了\n: ${error || stderr}`);
//         return;
//     }
//     const arr = stdout.match(/\S+/g).slice(1);
//     document.body.disks = arr;
//     console.log('盘符在此：', arr.join(', '));
// });


// const sPath = "D:/English video/迷失02/Lost.S02EP01.BluRay.iPad.720p.AAC.X264-CHDPAD.mp4";
// const sPath = "D:/English video/短片/Shadowing Step by Step.mp4";
// const sPath = "D:/English video/电影/AL塔：战斗天使.BD1280高清中字版.mp4";
// const sPath = "D:/English video/短片/老外：怎么可能快速学英语？！ - 1.字幕版.mp4";


// ▼将来用不上就删除
// ▼文本文件阅读器-废弃
// ipcMain.on('textReader', function(event, sPath) {
//     fs.readFile(sPath, "utf8", (err, data)=>{
//         const keyWords = 'Error: ENOENT: no such file or directory, open';
//         if (err && err.message.startsWith(keyWords)){
//             data = null; // null 有特殊含义，表示文件不存在
//         }
//         // console.log('2个方法', event.reply === event.sender.send); // false
//         // event.sender.send('textReaderReply', data, err); // 同样有效
//         event.reply('textReaderReply', data, err);
//     });
// });