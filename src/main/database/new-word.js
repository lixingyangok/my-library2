/*
 * @Author: 李星阳
 * @Date: 2022-01-16 10:40:40
 * @LastEditors: 李星阳
 * @LastEditTime: 2022-02-12 22:05:38
 * @Description: 
 */

import {sqlize} from './init-db.js';
import {oMedia} from './media.js';
const { DataTypes } = require('sequelize');

const oNewWord = module.exports.line = sqlize.define('new_word', {
    mediaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: oMedia, // 这是对另一个模型的参考
            key: 'id', // 这是引用模型的列名
        },
    },
    word: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.INTEGER, // 1新词汇, 2专有名词
        allowNull: false,
    },
});

oNewWord.sync();

export default {
    // ▼保存
    async saveOneNewWord(obj) {
        const hasSaved = await oNewWord.findOne({ 
            where: { mediaId: obj.mediaId, word: obj.word },
        });
        if (hasSaved) throw Error('不能重复保存');
        obj.type = (
            obj.type || (/^[A-Z].+/.test(obj.word) ? 2 : 1)
        );
        const res = await oNewWord.create(obj).catch(err=>{
            console.log('插入出错', err);
        });
        return res;
    },
    // ▼查询媒体的生词
    async getWordsByMedia({mediaId, more}) {
        const res = await oNewWord.findAll({
            where: { mediaId },
        });
        if (!res) return;
        return res.map(cur=>cur.dataValues);
    },
    // ▼修改媒体的生词
    async switchWordType(obj) {
        const res = await oNewWord.update({
            type: obj.type == 1 ? 2 : 1,
        }, {
            where: {
                mediaId: obj.mediaId,
                word: obj.word,
            },
        });
        return res;
    },
    // ▼删除媒体的生词
    async delOneNewWord(obj) {
        const res = await oNewWord.destroy({
            where: {
                mediaId: obj.mediaId,
                word: obj.word,
            },
        });
        return res;
    },
};

