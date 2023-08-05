/*
 * @Author: 李星阳
 * @Date: 2020-08-16 18:35:35
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-05 18:53:56
 * @Description: 这是智能断句的模块
 */
import {getPeaks, fixTime} from '../../../common/js/pure-fn.js';


// 智能断句的方法
// 2参是上一步的结尾的秒数，3参是在取得的区间的理想的长度（秒数）
export function figureOut(
    oMediaBuffer,
    fEndSec, // 起点秒
    fLong = 2.5, // 取的结果一定要超过x秒（此注释不是特别准）
    fRightDuration=20 // 在右侧多少秒范围内判断？（目前似乎没用上）
) {
    const [iPerSecPx, iWaveHeight, iAddition] = [100, 13, 25]; // 默认每秒宽度px值，波高度，添加在两头的空隙
    const aWaveArr = getWaveArr(oMediaBuffer, iPerSecPx, fEndSec, fRightDuration); // 取得波形
    // 初步看 iWaveHeight 有点像征兵用的标准身高值
    const aSection = getCandidateArr(aWaveArr, iPerSecPx, iWaveHeight);
    let { start, end } = (() => {
        const [oFirst, oSecond] = aSection;
        if (!oFirst) return { start: 0, end: aWaveArr.length };
        const start = Math.max(0, oFirst.start - iAddition);
        let { end, iGapToNext=3 } = (() => {
            const isFirstBetter = oFirst.long >= fLong || oFirst.iGapToNext > 1.2 || !oSecond;
            const idx = isFirstBetter ? 0 : 1;
            const [oChosen, oNextOne] = [aSection[idx], aSection[idx + 1]];
            // ▼ 下一段存在 && 很短 && 离它右边的邻居远 && 离我近
            if (oNextOne && oNextOne.long < 1 && oNextOne.iGapToNext > 1 && oChosen.iGapToNext < 1) {
                console.log(`%c尾部追加临近数据 ${oNextOne.long} 秒`, 'background: pink');
                return oNextOne; //并入下一段
            }
            return oChosen;
        })();
        end = fixTail(aWaveArr.slice(end), end, iPerSecPx, iAddition, iGapToNext);
        return { start, end };
    })();
    start = (fEndSec + start / iPerSecPx).toFixed(2) * 1;
    const farthest = oMediaBuffer.duration - 0.1;
    const fLastRegion = 0.3; // 最后一行宽0.3秒
    end = Math.min(fEndSec + end / iPerSecPx, farthest); //
    if (end == farthest && end - fEndSec < fLastRegion) {
        end = fLastRegion;
    }
    end = end.toFixed(2) * 1;
    return fixTime({start, end});
}

// ▼提供【波形数组】用于断句
function getWaveArr(oMediaBuffer, iPerSecPx, fEndSec, fRightDuration) {
    const { aPeaks } = getPeaks(
        oMediaBuffer,
        iPerSecPx, 
        iPerSecPx * fEndSec,
        iPerSecPx * fRightDuration // 取当前位置往右x秒
    );
    let {iWaveHeight = 0.5} = ls.get('oRecent')?.[ls.get('sFilePath')] || {};
    // 👆 从 lg 里取值不是最佳方案，先这样用着，再优化
    // ▼或许应优化为 idx+=2 节省一半的遍历次数，
    const myArr = aPeaks.reduce((result, cur, idx, arr) => {
        if (idx % 2) return result; // 只处理0、2、4 不处理1、3、5
        // ▼此处是否需要转整形，待考究
        let iOnePxHeight = Math.round((cur - arr[idx + 1]) * iWaveHeight);
        result.push(iOnePxHeight);
        return result;
    }, []);
    return myArr;
}

// ▼提供断句方法一个【候选区间的数组】
function getCandidateArr(aWaveArr, iPerSecPx, iWaveHeight) {
    const aSection = []; // 用于返回的数据
    for (let idx = 0; idx < aWaveArr.length; idx++) {
        const iCurHeight = aWaveArr[idx];
        if (iCurHeight < iWaveHeight) continue;
        const oLast = aSection[aSection.length-1];
        if (oLast && (idx - oLast.end) / iPerSecPx < 0.35) { //上一区间存在 && 距离上一区间很近(0.35秒之内)。则视为一段话，累加长度
            const { start, end, fAveHeight } = oLast;
            const pxLong = idx - start + 1;
            oLast.end = idx;
            oLast.long = pxLong / iPerSecPx; //长度（秒）
            oLast.fAveHeight = Math.round(((end - start + 1) * fAveHeight + iCurHeight) / pxLong); //平均高度
            continue;
        }
        aSection.push({ // 视为新句子，新建
            start: idx, 
            end: idx, 
            long: 0, 
            fAveHeight: iCurHeight,
        });
        if (!oLast) continue;
        oLast.iGapToNext = (idx - oLast.end) / iPerSecPx; //到下一步的距离
    }
    return aSection;
}

// ▼处理尾部
function fixTail(aWaveArr, iOldEnd, iPerSecPx, iAddition, iGapToNext) {
    // return iOldEnd + iAddition;
    const iSupplement = (() => { // 寻找合适的尾部位置（返回5表示追加5个px）
        for (let idx = 0; idx < iPerSecPx * 1; idx++) { 
            const iOneStepPx = 10; // 向右侧尾部探测的范围（几个px）
            const fAimHeight = 0.9; // 在 iOneStepPx 范围内平均波形高度小于此值，侧判断此处为合适的终点位置
            const iSum = aWaveArr.slice(idx, idx + iOneStepPx).reduce((result, cur) => {
                return result + cur;
            }, 0);
            // console.log(`循环${idx} ● iSum=${iSum} ● ${iSum / iOneStepPx}`);
            if (iSum / iOneStepPx < fAimHeight) return idx; // + parseInt(iPerSecPx * 0.1);
            // return idx + 5px;
        }
        return false;
    })();
    const iResult = (() => { // 指定新的尾部位置
        if (iSupplement && iSupplement < iPerSecPx * 1) {
            console.log(`%c尾部补充 ${iSupplement} px`, 'background: yellow');
            return iSupplement + iAddition; // iAddition * 0.7 太短
        }
        return iAddition; //默认补偿值
    })();
    const iMaxEnd = iOldEnd + (iGapToNext * iPerSecPx - iAddition * 0.5); // 允许的最大值
    return Math.min(iOldEnd + iResult, iMaxEnd); // 即便补偿，不能越界
}


