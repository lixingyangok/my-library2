/*
 * @Author: 李星阳
 * @Date: 2023-08-20 15:34:20
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-04 23:25:16
 * @Description: 
 */

// import {sPathForDB} from '../../../main/database/init-db.js';
// import Database from 'better-sqlite3';
const Database = require('better-sqlite3');
const sPathForDB = "D:/Program Files (gree)/my-library/myDB.db";
const btSqlite3 = new Database(sPathForDB, {});


Promise.resolve().then(()=>{
    const sql = `SELECT count(*) as iCount from media`;
    const a01Result = btSqlite3.prepare(sql).all();
    console.log(`😊 better-sqlite3 媒体数量: ${a01Result[0].iCount}`);
});



export {btSqlite3};




