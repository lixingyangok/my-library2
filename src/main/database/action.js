/*
 * @Author: 李星阳
 * @Date: 2023-08-09 21:11:17
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-09 21:31:34
 * @Description: 
 */

import {sqlize} from './init-db.js';
import {oMedia} from './media.js';
import {oLine} from './line.js';
const { DataTypes } = require('sequelize');

export const oAction = sqlize.define('action', {
    mediaId: { // 媒体记录的行ID，防止文件hash变化后引发错误
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: oMedia, // 这是对另一个模型的参考
            key: 'id', // 这是引用模型的列名
        },
    },
    lineId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: oLine,
            key: 'id',
        },
    },
    start: DataTypes.FLOAT,
    playAt: DataTypes.DATE, // 录入时间
    playSeconds: DataTypes.FLOAT,
    action: DataTypes.STRING, // playing, reading, writing
});
oAction.sync();

/*
User.sync() - 如果表不存在,则创建该表(如果已经存在,则不执行任何操作)
User.sync({ force: true }) - 将创建表,如果表已经存在,则将其首先删除
User.sync({ alter: true }) - 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
*/

export default {
    // ▼保存：一个
    async saveAction(obj) {
        const res = await oAction.create(obj);
        return res?.dataValues;
    },
    // ▼查询：一个或多个 ★ 用 sql 查询
    // async getAction(obj) {
    //     // obj: {hash, dir}
    //     const aRes = await oAction.findAll({
    //         where: obj,
    //     });
    //     return aRes.map(cur => cur.dataValues);
    // },
};


// ▼插入数据01
// const stmt = db.prepare(`
//     INSERT INTO media (hash, name, dir, size)
//     VALUES ($hash,$name,$dir,$size)
// `);
// stmt.run(prefixKey(obj), err => {
//     fnResolve(err);
// });
// stmt.finalize();

// ▼插入数据02
// console.log("Jane's auto-generated ID:", jane.id);
// const {oPromise, fnResolve, fnReject} = newPromise();
// const sql = `
//     INSERT INTO media (hash, name, dir, size)
//     VALUES ($hash, $name, $dir, $size)
// `;
// db.run(sql, prefixKey(obj), (err) => {
//     fnResolve(err);
// });
// const res = await oPromise;

// ▼查询数据
// const {oPromise, fnResolve, fnReject} = newPromise();
// const sql = "SELECT * FROM media where hash = ?";
// db.get(sql, sHash, (err, row) => {
//     if (err) return toLog('查询出错');
//     fnResolve(row);
// });
// return oPromise;

