/*
 * @Author: 李星阳
 * @Date: 2023-08-20 15:34:20
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-20 15:39:19
 * @Description: 
 */

import {sPathForDB} from '../../../main/database/init-db.js';
const Database = require('better-sqlite3');
const btSqlite3 = new Database(sPathForDB, {});


Promise.resolve().then(()=>{
    const sql = `SELECT count(*) as iCount from media`;
    const a01Result = btSqlite3.prepare(sql).all();
    console.log(`😊 better-sqlite3 媒体数量: ${a01Result[0].iCount}`);
});



export {btSqlite3};




