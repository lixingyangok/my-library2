
const moment = require('moment');
const iOneDaySeconds = 24 * 60 * 60; // 全天秒数

const oFnLib = {
    test(){
        console.log('test', );
    },
    async init(){
        const sToday = moment().format('yyyy-MM-DD') + ' 00:00:00';
        const oZeroClock = moment(sToday);
        // const iTodayBegan = new Date(sToday + ' 00:00:00') * 1;
        const sql = `
            SELECT
                mediaId, lineId, playFrom, playEnd, duration, action, gapToPrev,
                datetime(action.actionBegin, 'localtime') as actionBeginAt,
                datetime(action.actionEnd, 'localtime') as actionEndAt
            from action
            where actionBeginAt like '${sToday.slice(0,10)}%'
            order by actionBeginAt
        `;
        const aFixed = [];
        const [aResult] = await fnInvoke('db', 'doSql', sql);
        aResult.map((oCur, idx) => {
            // const oLast = aResult[idx-1];
            const oActionBegin = moment(oCur.actionBeginAt);
            const iSecOfDay = oActionBegin.diff(oZeroClock, 'seconds');
            oCur.iSecOfDay = iSecOfDay;
            oCur.iPercentOfDay01 = (iSecOfDay / iOneDaySeconds * 100).toFixed(5);
            if (idx==0) {
                return aFixed.push(oCur);
            }
            let oPre = aFixed.at(-1);
            if (oCur.gapToPrev && oCur.gapToPrev < 2){
                // ▼ 3参传 true 得到浮点数
                oPre.duration = moment(oCur.actionEndAt).diff(oPre.actionBeginAt, 'second', true);
                oPre.actionEndAt = oCur.actionEndAt;
                oPre.iLongPercent = (oPre.duration / iOneDaySeconds * 100).toFixed(2);
                oPre.qty = (oPre.qty || 0) + 1;
            }else{
                oCur.iLongPercent = (oCur.duration / iOneDaySeconds * 100).toFixed(2);
                aFixed.push(oCur);
            }
            return oCur;
        });
        aFixed.push(aResult[0]);
        console.log('aFixed：', aFixed);
        console.log('数量：', aResult.length, aFixed.length);
        this.aDayAction = aFixed;
    },
};


export default oFnLib;

