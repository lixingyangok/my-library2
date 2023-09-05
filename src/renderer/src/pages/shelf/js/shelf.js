import {SubtitlesStr2Arr} from '../../../common/js/pure-fn.js';
import {mySort, goToLounage} from '../../../common/js/common-fn.js';
import { ElMessageBox } from 'element-plus';
import {
    getFolderKids,
    getFolderChildren,
    addAllMediaDbInfo,
    checkFile,
    findMedia,
} from '../../../common/js/fs-fn.js';

const fsp = require('node:fs/promises');
// console.log('●\n', path.extname('aa.Txt'));

const fnAboutDB = {
    choseRoot(sCurRoot) {
        this.aPath = [sCurRoot];
    },
    // ▼查询所有媒体文件夹数据
    async getMediaHomesArr(){
        const aRes = await Promise.all([
            fnInvoke('db', 'getMediaHomes'), // 查询所有包含媒体的目录
            fnInvoke('db', 'getLineInfo'), // 查询所有媒体的字幕行数
        ]);
        if (!aRes[0] && !aRes[1]) return;
        this.oMediaHomes = aRes[0].reduce((oResult, oCur)=>{
            oResult[oCur.dir] = oCur.count;
            return oResult;
        }, {});
        this.oLineMap = aRes[1].reduce((oResult, oCur)=>{
            oResult[oCur.mediaId] = oCur.count;
            return oResult;
        }, {});
        return aRes;
    },
    // ▼弹出1级窗口-树
    showDialog(sPath){
        this.dialogVisible = true;
        this.aFolders = [];
        this.setTreeList(sPath);
    },
    // ▼插入1级窗口的树
    async setTreeList(sPath) {
        console.time('拿树');
        const obj = await getTree(sPath);
        console.timeEnd('拿树');
        if (!obj) return;
        const treeArr = [{
            label: sPath,
            sPath: obj.sPath,
            hasMedia: obj.hasMedia,
            children: treeObj2Arr(obj.children),
        }];
        this.aFolders = treeArr;
    },
    // ▼打开2级窗口————查询某个目录
    // TODO 应该把 getFolderKids 改为 getFolderChildren
    async checkFolder(oInfo){
        this.fucousFolder = oInfo.sPath;
        this.bMediaDialog = true;
        const aFolderMedia = await getFolderKids(oInfo.sPath);
        // console.log('aFolderMedia\n', aFolderMedia.$dc());
        this.aFolderMedia = aFolderMedia;
        addAllMediaDbInfo(this.aFolderMedia);
    },

    // ▼将某个文件夹内的媒体逐个保存媒体到DB
    async saveOneByOne(){
        // console.log('开始入库');
        const allHasHash = this.aFolderMedia.every(cur=>cur.hash);
        if (this.aFolderMedia.length && !allHasHash) {
            return this.$message.error('没有加载完');
        }
        let idx = -1;
        while (++idx < this.aFolderMedia.length){
            const oMedia = this.aFolderMedia[idx];
            if (!oMedia.infoAtDb) { // 不再重复保存
                const arr = oMedia.sPath.split('/');
                const oInfo = await fnInvoke('db', 'saveMediaInfo', {
                    hash: oMedia.hash,
                    name: arr.slice(-1)[0],
                    dir: arr.slice(0, -1).join('/'),
                });
                if (!oInfo) { // 媒体没存上不能存字幕，应 return 
                    return this.$message.error('保存媒体信息未成功');
                }
                oMedia.infoAtDb = oInfo;
            }
            if (this.oLineMap[oMedia.infoAtDb.id]) continue; //return
            this.saveLines(oMedia);
        }
        await this.getMediaHomesArr();
        this.setTreeList(this.aFolders[0].sPath);
    },
    async saveLines(oMedia){
        const {infoAtDb, srt} = oMedia;
        if (!srt || !infoAtDb) return;
        const res01 = await fsp.readFile(srt, 'utf8').catch(err=>{
            console.log('读取字幕未成功\n', srt);
        });
        const srtArr = SubtitlesStr2Arr(res01 || '');
        if (!res01 || !srtArr) {
            return this.$message.error('解析字幕文件未成功');
        }
        srtArr.forEach(cur => cur.mediaId = infoAtDb.id);
        const aRes = await fnInvoke('db', 'saveLine', srtArr);
        if (!aRes) return;
        this.oLineMap[infoAtDb.id] = aRes.length;
    },
};

const oAboutTree = {
    // ▼处理用户变更目录
    async getDirChildren() {
        const { aAimTo } = this;
        console.log('路径变化了：加载目录');
        this.aTree.splice(this.aPath.length, Infinity); // 清空某步之后的内容
        for (const [idx] of this.aPath.entries()) {
            const sPath = this.aPath.slice(0, idx + 1).join('/');
            // console.log('sPath\n', sPath);
            const aItems = await getFolderChildren(sPath);
            if (!aItems) continue;
            this.aTree.splice(idx, 1, aItems);
            addAllMediaDbInfo(this.aTree[idx]);
            aAimTo.length && this.aPath.push(aAimTo.shift());
        }
    },
    // ▼点击文件夹
    async ckickTree(i1, i2) {
        const {isDirectory, sItem} = this.aTree[i1][i2];
        if (isDirectory) { // 👈处理点击文件夹动作
            // ▼ this.aPath 正在被 watch 监听，操作会触发后续动作
            this.aPath.splice(i1 + 1, Infinity, sItem);
            return;
        }
        // ▲文件夹，▼文件
        const sFilePath = `${this.aPath.join('/')}/${sItem}`;
        const isMedia = await checkFile(sFilePath, oConfig.oMedia)
        if (!isMedia) return;
        this.goToLearn(sFilePath);
    },
    // ▼删除一项
    async checkDetail(oMedia){
        console.log(oMedia.$dc());
        const {id} = oMedia?.infoAtDb || {}; //媒体 ID
        if (!id) return; 
        this.oMediaInfo.isShow = true;
        this.loadMediaInfo(id);
    },
    // ▼加载媒体信息
    async loadMediaInfo(iMediaID){
        const aTask01 = [
            fnInvoke('db', 'doSql', `select * FROM media WHERE id=${iMediaID};`),
            fnInvoke('db', 'doSql', `select * FROM line WHERE mediaId=${iMediaID};`),
            fnInvoke('db', 'doSql', `select * FROM new_word WHERE mediaId=${iMediaID};`),
        ];
        const [[aMedia], [aLine], [aWords]] = await Promise.all(aTask01);
        // console.log(aMedia[0], aLine, aWords);
        Object.assign(this.oMediaInfo, {
            oMedia: aMedia[0] || {},
            aLines: aLine || [],
            aWords: aWords || [],
        });
    },
    // ▼删除
    async toForgetMedia(oMedia){
        const {id} = oMedia;
        console.log(oMedia.$dc());
        const sAnswer = await ElMessageBox.confirm(
            '确认删除?', '请注意',
            {
                confirmButtonText: '确认删除',
                cancelButtonText: '取消',
                type: 'warning',
            }
        ).catch(xx=>xx);
        if (sAnswer != 'confirm') return;
        const aTask = [
            fnInvoke('db', 'doSql', `DELETE FROM action WHERE mediaId=${id};`),
            fnInvoke('db', 'doSql', `DELETE FROM new_word WHERE mediaId=${id};`),
            fnInvoke('db', 'doSql', `DELETE FROM line WHERE mediaId=${id};`),
        ];
        await Promise.all(aTask);
        await fnInvoke('db', 'doSql', `DELETE FROM media WHERE id=${id};`);
        await this.loadMediaInfo(id);
        this.getDirChildren();
    },
    // ▼跳转到学习页
    goToLearn(sFilePath) {
        goToLounage(sFilePath);
    },
    // ▼如果文件名名文件位置变化了，此方法用于记录新的信息到数据库
    async updateMediaInfo(){
        let aLast = this.aTree[this.aTree.length-1];
        for await (let [idx, val] of aLast.entries()){
            const {isMedia, infoAtDb, bNameRight, sPath} = val;
            const isWrong = isMedia && infoAtDb && !bNameRight;
            if (!isWrong) continue;
            const aPath = sPath.split('/');
            const res = await fnInvoke("db", 'updateMediaInfo', {
                id: infoAtDb.id,
                dir: aPath.slice(0,-1).join('/'),
                name: aPath.pop(),
            });
            if (!res) return;
            vm.$message.success(`文件：${idx} 位置与文件名更新完成`);
        }
        this.getDirChildren();
    },
};

export default {
    ...fnAboutDB,
    ...oAboutTree,
};

async function getTree(sPath) {
    const oStat = await fsp.stat(sPath);
    if (!oStat.isDirectory()) return;
    const aDirKids = await fsp.readdir(sPath);
    if (!aDirKids.length) return;
    const children = {};
    const aPromises = [findMedia(sPath)].concat(
        aDirKids.map(async sCur => {
            const obj = await getTree(`${sPath}/${sCur}`);
            if (obj) children[sCur] = obj;
        })
    );
    const [hasMedia] = await Promise.all(aPromises);
    const iKeys = Object.keys(children).length;
    if (!hasMedia && !iKeys) return;
    return { hasMedia, children, sPath };
}

function treeObj2Arr(obj){
    if (!obj) return [];
    const arr = [];
    for (const [label, oInfo] of Object.entries(obj)){
        if (!oInfo) continue;
        const children = treeObj2Arr(oInfo.children);
        mySort(children, 'label');
        arr.push({
            label,
            sPath: oInfo.sPath,
            hasMedia: oInfo.hasMedia,
            children,
        });
    }
    return arr;
}

// ▼ 将某个目录下的文件(夹)都显示出来
// async setFileList(idx, sDir, aItems) {
//     let [a01, a02, a03] = [[], [], []];
//     const oSrtFiles = {};
//     const aPromises = aItems.map(async (sItem, idx) => {
//         const sCurPath = `${sDir}/${sItem}`;
//         const oStat = await fsp.stat(sCurPath);;
//         const isDirectory = oStat.isDirectory();
//         const oItem = { sItem, isDirectory, sPath: sCurPath };
//         if (isDirectory) {
//             oItem.hasMedia = await findMedia(sCurPath);
//             return a01.push(oItem);
//         }
//         oItem.isMedia = await checkFile(sCurPath, oConfig.oMedia);
//         if (oItem.isMedia) {
//             const oMeidaItem = await this.addMediaInfo01(oItem);
//             oSrtFiles[oMeidaItem.srt] = !!oMeidaItem.srt;
//             return a02.push(oMeidaItem);
//         }
//         await checkFile(sCurPath) && a03.push(oItem);
//     });
//     await Promise.all(aPromises);
//     a03 = a03.filter(cur => {
//         return !oSrtFiles[`${sDir}/${cur.sItem}`];
//     });
//     [a01, a02, a03].forEach(curArr => mySort(curArr, 'sItem'));
//     const arr = [...a01, ...a02, ...a03];
//     this.aTree.splice(idx, 1, arr);
//     // this.addMediaInfo02(this.aTree[idx]);
// },

// async addMediaInfo02(arr){
//     if (!arr) return;
//     for (const [idx, oMedia] of arr.entries()) {
//         if (!oMedia.isMedia) continue;
//         if (idx % 3) this.getOneMediaInfoFromDB(oMedia);
//         else await this.getOneMediaInfoFromDB(oMedia);
//     }
// },

// ▼将媒体补充一些信息上去
// async addMediaInfo01(oItem){
//     oItem.infoAtDb = false;
//     const sSrtFile = oItem.sPath.split('.').slice(0, -1).join('.') + '.srt';
//     const oStat = await fsp.stat(sSrtFile).catch(()=>false);
//     if (oStat) oItem.srt = sSrtFile;
//     return oItem;
// },

// // ▼查询是否为媒体文件
// async function checkFile(sFilePath, oFileType=oConfig.oFileType) {
//     const sTail = path.extname(sFilePath).toLowerCase();
//     if (!oFileType[sTail]) return;
//     const oStat = await fsp.stat(sFilePath);
//     return !oStat.isDirectory();
// }

// ▼查询目录是否为【媒体文件夹】
// async function findMedia(sPath, oTarget) {
//     const oStat = await fsp.stat(sPath);
//     if (!oStat.isDirectory()) return 0;
//     let iSum = 0;
//     const aDirKids = await fsp.readdir(sPath);
//     const arr = aDirKids.map(async sCur=>{
//         const isMedia = await checkFile(`${sPath}/${sCur}`, oConfig.oMedia);
//         if (isMedia) iSum++;
//     });
//     await Promise.all(arr);
//     return iSum;
// }

// ▼查询【某1个媒体】在DB中的信息
// async getOneMediaInfoFromDB(oMedia){
//     const hash = await fnInvoke('getHash', oMedia.sPath);
//     const res = await fnInvoke('db', 'getMediaInfo', {hash});
//     oMedia.hash = hash;
//     oMedia.infoAtDb = res[0];
// },