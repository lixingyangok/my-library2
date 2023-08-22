import {btSqlite3} from './init.js';
const moment = require('moment');


export function getMediaActionRows(iMediaID){
    // ${sGetDuration},
    let sSql = `
        SELECT
            lineId,
            mediaId,
            count(*) as row_count,
            sum(duration) as duration_um
        from action_view
        where action_view.mediaId = ${iMediaID}
        group by lineId, mediaId
    `;
    console.time('查询某个媒体信息');
    const stmt = btSqlite3.prepare(sSql);
    console.timeEnd('查询某个媒体信息');
    const aResult = stmt.all();
    return aResult;
}

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




// ▼可能不需要
export function getMediaActions(iMediaID){
    let innerTB = `
        SELECT *
        from action_view
        where action_view.mediaId = ${iMediaID}
    `;
    let sSql = `
        SELECT
            sum(t01.duration) as allSec,
            count(*) as iCount
        FROM action_view as t01 
        group by mediaId
    `;
    // limit 100
    // console.log('sSql\n', sSql);
    const stmt = btSqlite3.prepare(sSql);
    const aResult = stmt.all();
    // console.log(`当前媒体 ${iMediaID} 数量0：`, aResult[0]);
    return aResult;
}


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


