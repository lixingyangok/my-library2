/*
 * @Author: 李星阳
 * @Date: 2022-01-16 10:40:40
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-28 16:41:26
 * @Description: 
 */

import {sqlize, sPathForDB} from './init-db.js';
import {oMedia} from './media.js';
const { Op, DataTypes } = require('sequelize');
const Database = require('better-sqlite3');
const db02 = new Database(sPathForDB, 
    { /* verbose: console.log  */}    
);

const oLine = module.exports.line = sqlize.define('line', {
    mediaId: { // 媒体记录的行ID，防止文件hash变化后引发错误
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: oMedia, // 这是对另一个模型的参考
            key: 'id', // 这是引用模型的列名
        },
    },
    start: DataTypes.FLOAT,
    end: DataTypes.FLOAT,
    text: DataTypes.STRING, // 原文
    trans: DataTypes.STRING, // 译文
    filledAt: DataTypes.DATE, // 录入时间
    // 笔记内容？
});

oLine.sync();

const oFn = {
    // ▼批量保存（导入用）
    async saveLine(arr) {
        const res = await oLine.bulkCreate(arr, {
            // ▼ updateOnDuplicate 是在插入的时候如果主键冲突就执行更新操作，且在数据中声明的键才会被更新
            updateOnDuplicate: ['start', 'end', 'text', 'trans', 'filledAt', 'updatedAt'],
        });
        return res;
    },
    // ▼修改字幕
    async updateLine(obj) {
        const t01 = new Date().getTime();
        const {toSaveArr=[], toDelArr=[], isReturnAll, mediaId} = obj;
        const arr = [[], 0];
        if (toSaveArr.length) {
            obj.toSaveArr.forEach(cur => {
                if (cur.filledAt || !cur.text) return;
                cur.filledAt = new Date();
            });
            arr[0] = oFn.saveLine(toSaveArr);
        }
        if (toDelArr.length) {
            arr[1] = oLine.destroy({
                where: { id: obj.toDelArr },
            });
        }
        const res = await Promise.all(arr);
        toLog('修改耗时：', new Date() - t01);
        let aNewRows = [];
        if (isReturnAll){
            aNewRows = await oFn.getLineByMedia(mediaId);
        }
        const oResult = {
            save: res[0]?.map(cur => cur.dataValues) || [],
            delete: res[1],
            newRows: aNewRows,
        };
        return oResult;
    },
    // ▼查询：统计所有【媒体字幕】
    async getLineInfo() {
        const { oPromise, fnResolve, fnReject } = newPromise();
        const sql = `
            SELECT line.mediaId, count(*) as count
            FROM line
            group by line.mediaId
        `;
        db.all(sql, (err, row) => {
            if (err) return toLog('查询出错');
            fnResolve(row);
        });
        return oPromise;
    },
    // ▼查询：某个媒体的所有字幕行
    async getLineByMedia(mediaId) {
        Promise.resolve().then(()=>{
            const t01 = new Date()*1;
            const sql = `
                SELECT id, start, end, text, filledAt, updatedAt
                FROM line
                where mediaId = ${mediaId}
                ORDER BY start ASC
            `.replace(/\s+/g, ' ');
            const a01Result = db02.prepare(sql).all();
            toLog('查询耗时111：', (new Date() - t01), a01Result.length);
        });
        const t02 = new Date()*1;
        const res = await oLine.findAll({
            attributes: ['id', 'start', 'end', 'text', 'filledAt'], // filledAt 是有必要的
            where: {mediaId},
            order: [['start', 'asc']],
        });
        if (!res) return;
        toLog('查询耗时222：', (new Date() - t02));
        const aResult = res.map(cur => cur.dataValues);
        return aResult;
    },
    // ▼查询：按单词搜索字幕
    async searchLineBybWord(word) {
        const res = await oLine.findAndCountAll({
            where: {
                [Op.and]: [
                    {text: {[Op.like]: `%${word}%`}},
                    {text: {[Op.like]: `% %`}},
                ],
            },
            group: ['text'],
            order: [['mediaId']],
            offset: 0,
            limit: 50,
        });
        if (!res) return;
        res.rows = res.rows.map(cur=>cur.dataValues);
        return res;
    },
};

export default oFn;

