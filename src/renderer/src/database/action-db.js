import {btSqlite3} from './init.js';
const moment = require('moment');
const sGetDuration = `
    (
        strftime('%s', createdAt) - strftime('%S', createdAt) + strftime('%f', createdAt) -
        (strftime('%s', actionBegin) - strftime('%S', actionBegin) + strftime('%f', actionBegin))
    ) as duration
`;
const getBeginAndEndTime = `
    datetime(actionBegin, 'localtime') as actionBeginAt,
    datetime(createdAt, 'localtime') as actionEndAt
`;

export function getMediaActions(iMediaID){
    console.log('iMediaID ♥', iMediaID);
    let innerTB = `
        SELECT *, ${sGetDuration}
        from action
        where action.mediaId = ${iMediaID}
    `;
    let sSql = `
        SELECT
            sum(t01.duration) as allSec,
            count(*) as iCount
        FROM (${innerTB}) as t01 
        group by mediaId
    `;
    // limit 100
    // console.log('sSql\n', sSql);
    const stmt = btSqlite3.prepare(sSql);
    const aResult = stmt.all();
    // console.log(`当前媒体 ${iMediaID} 数量0：`, aResult[0]);
    return aResult;
}

export function getActionByDay(sToday){
    sToday ||= moment().format('yyyy-MM-DD');
    const sql = `
        SELECT
            ${getBeginAndEndTime},
            ${sGetDuration},
            mediaId, lineId, playFrom, playEnd, action
        from action
        where actionBeginAt like '${sToday}%'
        order by actionBeginAt
    `;
    const stmt = btSqlite3.prepare(sql);
    const aResult = stmt.all();
    // console.log(`当天练习记录 ${sToday} 数量: `, aResult);
    // console.log(`当天练习记录 ${sToday} 数量: `, aResult.length);
    return aResult;
}


