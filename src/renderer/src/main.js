import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import router from './router/router.js';
import store2 from 'store2';
import { createPinia } from 'pinia';
import { newPromise, setGlobal } from './common/js/global-setting.js';
// import {btSqlite3} from '@/database/init.js'; // 好像不用挂到全局

// ▼ 样式
import './common/style/minireset.css';
import './common/style/global.scss';
import './common/lib/fontawesome-free-5.15.4-web/css/all.min.css';
import 'element-plus/dist/index.css';

try{
    // 浏览器环境无法 require
    const { ipcRenderer } = require('electron');
    window.oRenderer = ipcRenderer;
    window.fnInvoke = ipcRenderer.invoke;
    // const Database = require('better-sqlite3');
    // db2Provide = btSqlite3;
    // btSqlite3 = new Database(sPathForDB, {});
    // Promise.resolve().then(()=>{
    //     const sql = `SELECT count(*) as iCount from media`;
    //     const a01Result = btSqlite3.prepare(sql).all();
    //     console.log(`😊 better-sqlite3 媒体数量: ${a01Result[0].iCount}`);
    // });
}catch(err){
    console.log('no electron');
}

// ▼ 其它声明，全局声明一定前置
window.ls = store2; // lg = localStorage
window.newPromise = newPromise;

const pinia = createPinia();
ls.set('oRecent', ls.get('oRecent') || {});
setGlobal();

// ▼ app
const myApp = createApp(App);
// console.log('myApp', Object.keys(myApp));
// myApp._component.abc = 123;
// console.log('myApp', myApp._component.abc);
// myApp.provide('$btSqlite3', btSqlite3);

myApp.use(router);
myApp.use(pinia);
myApp.use(ElementPlus);
myApp.mount('#app');
