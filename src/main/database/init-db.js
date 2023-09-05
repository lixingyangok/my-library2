/*
 * @Author: 李星阳
 * @Date: 2022-01-12 19:32:20
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-04 23:24:41
 * @Description: 
 */
const { Sequelize } = require('sequelize');
const sPathForDB = "D:/Program Files (gree)/my-library/myDB.db";
let sqlite3 = require('sqlite3');
sqlite3.verbose();
const db = new sqlite3.Database(sPathForDB); // 建立数据库链接

// ▼建立数据库链接
const sqlize = new Sequelize({
    dialect: 'sqlite',
    storage: sPathForDB,
    define: {
        freezeTableName: true,
    },
});

// ★★★ 原则上应只用于查询 ★★★
async function doSql(sTheSQL){
    const [results, metadata] = await sqlize.query(
        sTheSQL,
    );
    return [results, metadata];
};

export {
    sqlize,
    doSql,
    db,
    sPathForDB,
}


/* 
    'close',               'exec',
    'wait',                'loadExtension',
    'serialize',           'parallelize',
    'configure',           'interrupt',
    'open',                'constructor',
    '_events',             '_eventsCount',
    '_maxListeners',       'setMaxListeners',
    'getMaxListeners',     'emit',
    'addListener',         'on',
    'prependListener',     'once',
    'prependOnceListener', 'removeListener',
    'off',                 'removeAllListeners',
    'listeners',           'rawListeners',
    'listenerCount',       'eventNames',
    'prepare',             'run',
    'get',                 'all',
    'each',                'map',
    'backup'
*/

// setTimeout(()=>{
//     toLog('5秒之后加载');
//     db.loadExtension(
//         './sqlite-pcre.c',
//         function(err, res){
//             console.log('\nxyz 002', err);
//             console.log('\nxyz 002', res);
//         }
//     );
//     db.loadExtension(
//         'D:/github/my-library/electron/database/sqlite-pcre.c',
//         function(err, res){
//             console.log('\nxyz 003', err);
//             console.log('\nxyz 003', res);
//         }
//     );
// }, 5 *1000);

// console.log('loadEnvironment', db.loadEnvironment);
// console.log(sqlite3.create_function);
// console.log(sqlite3.createFunction);
// console.log(sqlite3.sqlite3_create_function);
// console.log(sqlite3.sqlite3CreateFunction);
// console.log(sqlite3.registerFunction);
// console.log(sqlite3.RegisterFunction);
// console.log(sqlite3.RegisterFunctions);
// ----------------------------------------------------
// console.log(db.create_function);
// console.log(db.createFunction);
// console.log(db.sqlite3_create_function);
// console.log(db.sqlite3CreateFunction);
// console.log(db.registerFunction);
// console.log(db.RegisterFunctions);
// console.log(db.RegisterFunction);