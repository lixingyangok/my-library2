/*
 * @Author: 李星阳
 * @Date: 2023-09-06 21:43:18
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-06 22:38:29
 * @Description: 
 */

const task_line = [
    
];


export function get_text(){
    return {
        task: task_line.shift(),
    };
};

export function send_text(oParam){
    toLog('查看数据类型：typeof oParam', typeof oParam);
    var aEntries = [...Object.entries((oParam|| {aaa:111}))];
    toLog('数据', aEntries);
    task_line.push(oParam);
    return oParam;
}
