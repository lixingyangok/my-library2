
// ▼切分句子
// export function splitSentence(sWord, sKey){
//     sKey = sKey.toLowerCase();
//     sWord = sWord.toLowerCase();
//     if (sKey == sWord) return 'l-01';
//     if (sWord.startsWith(sKey)) return 'l-02';
//     if (sWord.includes(sKey)) return 'l-03';
//     return '';
// }

import { getTubePath } from '@/common/js/common-fn.js';
import {playOnePiece} from '@/common/js/pure-fn.js';

export function groupThem(arr){
    if (!arr.length) return [];
    const aResult = [];
    for (const cur of arr){
        let oLastOne = aResult.at(-1) || {};
        if (oLastOne.dir == cur.dir){
            oLastOne.aList.push(cur);
        }else{
            aResult.push({dir: cur.dir, aList: [cur]});
        }
    }
    return aResult;
}

// ▼切割句子
export function splitSentence(text, sKey){
    const reg = new RegExp(`${sKey}`, 'ig');
    const aResult = [];
    let iLastEnd = 0;
    text.replace(reg, (sCurMach, iCurIdx) => {
        // console.log(sCurMach, iCurIdx);
        iCurIdx && aResult.push(text.slice(iLastEnd, iCurIdx));
        // const sClassName = (
        //     oData.oKeyWord[sCurMach.toLowerCase()] ? 'red' : 'blue'
        // );
        aResult.push({ 
            // sClassName,
            word: sCurMach,
        });
        iLastEnd = iCurIdx + sCurMach.length;
    });
    if (!iLastEnd) return [text];
    if (iLastEnd < text.length){
        aResult.push(text.slice(iLastEnd));
    }
    return aResult;
}

// ▼播放例句
export function clickSentense(oTarget){
	const path = getTubePath(oTarget.path);
    const oNewOne = { ...oTarget, path };
    // console.log('oNewOne', oNewOne.$dc());
    // ▼返回的 oAudio 用于关闭播放
    const oAudio = playOnePiece(oNewOne);
}

// export function afterOpened(){
//     console.log('窗口已经打开：准备加载外部站点');
// }

// export function handleClick(tab, event) {
//     console.log('页签已经切换');
//     // console.log(tab, event);
// }
