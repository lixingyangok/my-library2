import {btSqlite3} from './init.js';
import moment from 'moment';

// ▼查询某个媒体的练习记录
export function getMediaActionRows(iMediaID){
    let sSql = `
        SELECT
            lineId,
            mediaId,
            count(*) as practice_times,
            sum(duration) as duration_um
        from action_view
        where action_view.mediaId = ${iMediaID}
        group by lineId, mediaId
    `;
    // console.time('查询某个媒体练习记录');
    const stmt = btSqlite3.prepare(sSql);
    // console.timeEnd('查询某个媒体练习记录'); // 耗时小于 1ms
    const aResult = stmt.all();
    return aResult;
}

// ▼查询每天的练习记录
export function getActionByDay(sToday){
    sToday ||= moment().format('yyyy-MM-DD');
    const sql = `
        SELECT *
        from action_view
        where actionBeginAt like '${sToday}%'
        order by actionBeginAt
    `;
    const stmt = btSqlite3.prepare(sql);
    const aResult = stmt.all();
    // console.log(`当天练习记录 ${sToday} 数量: `, aResult);
    // console.log(`当天练习记录 ${sToday} 数量: `, aResult.length);
    return aResult;
}

// TODO 查询累计所有的练习时长，本周，本月，每月，每年，





// ▼可能不需要
// ▼注释于 2023.08.23 22:06:49 星期三
// export function getMediaActions(iMediaID){
//     let innerTB = `
//         SELECT *
//         from action_view
//         where action_view.mediaId = ${iMediaID}
//     `;
//     let sSql = `
//         SELECT
//             sum(t01.duration) as allSec,
//             count(*) as iCount
//         FROM action_view as t01 
//         group by mediaId
//     `;
//     // limit 100
//     // console.log('sSql\n', sSql);
//     const stmt = btSqlite3.prepare(sSql);
//     const aResult = stmt.all();
//     // console.log(`当前媒体 ${iMediaID} 数量0：`, aResult[0]);
//     return aResult;
// }


// export function getMediaActionRows(iMediaID){
//     let sSql = `
//         SELECT
//             action, playFrom, playEnd, mediaId, lineId,
//             ${getBeginAndEndTime}, ${sGetDuration}
//         from action
//         where action_view.mediaId = ${iMediaID}
//         order by playFrom
//     `;
//     const stmt = btSqlite3.prepare(sSql);
//     const aResult = stmt.all();
//     return aResult;
// }


