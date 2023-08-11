/*
 * @Author: 李星阳
 * @Date: 2023-08-09 21:11:17
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-11 22:27:06
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
    playFrom: DataTypes.FLOAT,
    playEnd: DataTypes.FLOAT,
    actionBegin: DataTypes.DATE, // 录入时间
    actionEnd: DataTypes.DATE, // 结束时间
    gapToPrev: DataTypes.FLOAT, // 本次开始与上次结束的间距秒
    duration: DataTypes.FLOAT,
    action: DataTypes.STRING, // playing, reading, writing, speaking
});
User.sync();

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
    // ▼删除行时调用
    async removeLineID(aLineId) {
        const arr = aLineId.map(lineId=>{
            const where = { lineId };
            const res = oAction.update({ lineId: null }, { where });
            return res;
        });
        const aRes = await Promise.all(arr);
        return aRes;
    },
    // ▼查询：一个或多个 ★ 用 sql 查询（没用上）
    async getAction(obj) {
        const aRes = await oAction.findAll({
            where: obj,
            order: [['actionBegin', 'asc']],
        });
        return aRes.map(cur => cur.dataValues);
    },
};



