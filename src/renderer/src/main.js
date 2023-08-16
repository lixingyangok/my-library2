import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import router from './router/router.js';
import store2 from 'store2';
import { createPinia } from 'pinia';
import { newPromise, setGlobal } from './common/js/global-setting.js';
// import {sPathForDB} from '../../main/database/init-db.js';

// ▼ 样式
import './common/style/minireset.css';
import './common/style/global.scss';
import './common/lib/fontawesome-free-5.15.4-web/css/all.min.css';
import 'element-plus/dist/index.css';
try{
    // 浏览器环境无法 require
    const { ipcRenderer } = require('electron');
    const Database = require('better-sqlite3');
    window.oRenderer = ipcRenderer;
    window.fnInvoke = ipcRenderer.invoke;
    const sPathForDB = "D:/Program Files (gree)/my-library/myDB.db";
    const db02 = new Database(sPathForDB, 
        { /* verbose: console.log  */}    
    );
    const sql = `SELECT count(*) from media`;
    const a01Result = db02.prepare(sql).all();
    console.log('媒体数量😊', a01Result[0]);
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
myApp.use(router);
myApp.use(pinia);
myApp.use(ElementPlus);
myApp.mount('#app');
