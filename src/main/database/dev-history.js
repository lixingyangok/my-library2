/*
 * @Author: 李星阳
 * @Date: 2022-01-16 20:03:49
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-04-29 17:46:27
 * @Description: 
 */
import {sqlize} from './init-db.js';
const { DataTypes } = require('sequelize');

const oHistory = ( module.exports.history ) = sqlize.define('dev_history', {
    note: {
        type: DataTypes.STRING,
    },
}, {
    // freezeTableName: true,
});
oHistory.sync();

export default {
    // ▼插入一条开发记录（废弃）
    async addDevRecord (){
        db.run("INSERT INTO dev_history VALUES ($time)", {
            $time: new Date().toLocaleString(),
        });
        db.get("SELECT count(*) FROM dev_history", function(err, row) {
            if (err) return;
            toLog('开发记录数量：', row['count(*)']);
        });
    },
    // ▼插入一条开发记录
    async addOneRecord (note='测试中'){
        await oHistory.create({
            note,
        }).catch(err=>{
            console.log('插入出错', err);
        });
        // db.get("SELECT count(*), REGEXP() as bb FROM dev_history", function(err, row) {
        //     toLog('开发记录数量01：', err, row);
        // });
        // try{
        //     db.get("SELECT count(*) FROM dev_history where note REGEXP '[0-9]{1,3}'", function(err, row) {
        //         toLog('开发记录数量01.5：', err, row);
        //     });
        //     db.get("SELECT count(*) FROM dev_history where note regexp '[0-9]{1,3}'", function(err, row) {
        //         toLog('开发记录数量01.6：', err, row);
        //     });
        // }catch(e2){
        //     console.log('正则03\n\n');
        //     toLog('开发记录数量03：', e2);
        // }
    },
}

