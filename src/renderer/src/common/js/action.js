/*
 * @Author: 李星阳
 * @Date: 2023-08-13 20:12:08
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-13 23:46:50
 * @Description: 
 */

import {useActionStore} from '@/store/index.js';
const oActionStore = useActionStore();

export default class {
    sActionType = '';
    iLastActionEndAt = 0;
    oRecord = {
        action: '',
        mediaId: null, // props.oMediaInfo.id,
        lineId: 0, // oCurLine.value.id || null, // 断句期间可能没有 ID 
        actionBegin: 0, 
        // actionEnd: 0, // 后补：行动结束时间
        // duration: 0, // 后补：执行了 x 秒
        // ▼可选项 ===========================================
        // gapToPrev: 0, // 默认不添加此键
        // playFrom: 0, // oInitParam.startSec, // 播放起点
        // playEnd: 0, // 播放至 x 秒
    };
    constructor(sActionType){
        const aActionList = ['playing', 'reading'];
        if (aActionList.includes(sActionType) == false){
            throw '请输入行动类型';
        }
        this.sActionType = sActionType;
    }
    // oAction.currentTime 是初始化时媒体的播放停止点，可能停在句尾，也可能在运行中某处
    // ▼初始化（按需保存）
    async initRecord(oAction){
        const actionBegin = new Date().getTime();
        oAction.action = this.sActionType;
        oAction.actionBegin = actionBegin;
        if (oAction.ongoing){
            oAction.gapToPrev = 0; // gapToPrev 好像没用处
            // ▼这里执行完成之前千万不要污染 this.oRecord
            await this.saveRecord(oAction.currentTime);
        }else if (this.iLastActionEndAt){
            oAction.gapToPrev = 1 * ((actionBegin - this.iLastActionEndAt) / 1000).toFixed(2);
        }
        console.log(`已初始化记录，距离上次：${oAction.gapToPrev}`, /* oAction */);
        this.oRecord = oAction;
    };
    // ▼保存
    async saveRecord(playEnd=undefined){
        // if (!this.oRecord.mediaId) alert('无法保存播放动作');
        // const playEnd = oDom.oAudio.currentTime;
        const playingMode = this.sActionType == 'playing';
        if (playingMode && !playEnd){
            throw '播放模式请传入媒体当前时间点'
        }
        const actionEnd = new Date() * 1;
        const duration = 1 * ((actionEnd - this.oRecord.actionBegin) / 1000).toFixed(2);
        this.iLastActionEndAt = actionEnd; // 对下次生成记录有用处
        if (duration <= 0.5){
            return console.log(`播放时长短：${duration} 不记录`);
        }
        // ▼然后先快速拷贝出一份，以让后续程序运行，复制品用于慢慢地保存到数据库，
        const addtion = { duration, actionEnd };
        if (playingMode) addtion.playEnd = playEnd; // 阅读模式不取动态值取初始值
        const useToSave = Object.assign(structuredClone(this.oRecord), addtion);
        console.log(`已“补全了”记录：${duration} 秒`, /* useToSave */);
        this.doSaving(useToSave);
    };
    async doSaving(useToSave){
        const oSaved = await fnInvoke('db', 'saveAction', useToSave);
        // .then(this.afterSaved);
        if (!oSaved) alert('保存学习记录失败，请注意');
        oActionStore.init();
        // console.log('useToSave', useToSave);
        // console.log('oSaved', oSaved);
    }
};


// ▼弃用
function a1 (sActionType){
    const aActionList = ['playing', 'reading'];
    if (aActionList.includes(sActionType) == false){
        throw '请输入行动类型';
    }
    let oRecordObj = {
        action: '',
        mediaId: null, // props.oMediaInfo.id,
        lineId: 0, // oCurLine.value.id || null, // 断句期间可能没有 ID 
        actionBegin: 0, 
        // actionEnd: 0, // 后补：行动结束时间
        // duration: 0, // 后补：执行了 x 秒
        // ▼可选项 ===========================================
        // gapToPrev: 0, // 默认不添加此键
        // playFrom: 0, // oInitParam.startSec, // 播放起点
        // playEnd: 0, // 播放至 x 秒
    };
    // ▼初始化播放记录
    function initRecord(oActionInfo){
        const actionBegin = new Date().getTime();
        const {actionEnd} = oRecordObj; // 提前保存好上次行动结束时间
        const example = {
            action: sActionType,
            mediaId: props.oMediaInfo.id,
            lineId: oCurLine.value.id || null, // 断句期间可能没有 ID 
            actionBegin, 
            playFrom: oActionInfo.startSec, // 播放起点
            // ▲确定信息 ▼待定信息（后补）
            // gapToPrev: 0, // 默认不添加此键
            // duration: 0, // 播放了 x 秒
            // actionEnd: 0, // 行动结束时间
            // playEnd: 0, // 播放至 x 秒
        };
        oActionInfo.actionBegin = sActionType;
        oActionInfo.actionBegin = actionBegin;
        if (oActionInfo.ongoing){
            oActionInfo.gapToPrev = 0;
        }else if (actionEnd){
            oActionInfo.gapToPrev = 1 * ((actionBegin - actionEnd) / 1000).toFixed(2);
        }
        // console.log('已经初始化学习记录', obj01);
        oRecordObj = structuredClone(oActionInfo)
    };
    // ▼保存播放动作
    async function saveRecord(){
        if (!oPlayAction.mediaId) alert('无法保存播放动作');
        const playEnd = oDom.oAudio.currentTime;
        const duration = 1 * (playEnd - oPlayAction.playFrom).toFixed(2);
        if (duration <= 0.5){
            return console.log(`播放时长短：${duration} 不记录`);
        }
        oPlayAction = Object.assign(oPlayAction, { // 将记录补充完整（对下次生成记录有用处）
            duration: duration,
            playEnd: playEnd,
            actionEnd: new Date() * 1,
        });
        // ▼然后先快速拷贝出一份，以让后续程序运行，复制品用于慢慢地保存到数据库，
        const useToSave = oPlayAction.$dc();
        // console.log('已 “补全了”学习记录：', useToSave);
        fnInvoke('db', 'saveAction', useToSave).then(oSaved => {
            // console.log('已 “保存了”学习记录：', oSaved);
            if (!oSaved) alert('保存学习记录失败，请注意');
        });
    };
    // ▼ 初始化播放记录（按需记录播放动作）
    async function toRecordAction(oParam){
        if (!props.oMediaInfo?.id) return;
        const oInitParam = {
            playing: oData.playing,
            startSec: oParam.startSec, 
        };
        if(oData.playing){
            await saveRecord();
            // console.log('播放中 => 播放');
        }
        // else if (isFromStop === true){ // 从静止到播放
        //     0 && console.log('静止 => 播放');
        // }
        oPlayAction = initRecord(oInitParam);
    };
    const oFn = {
        initRecord,
        saveRecord,
        toRecordAction,
    };
    return oFn;
}




