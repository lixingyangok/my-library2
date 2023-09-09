/*
 * @Author: 李星阳
 * @Date: 2023-09-06 21:43:18
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-09 20:48:33
 * @Description: 
 */


const task_line = [];

export function get_text(){
    return task_line.shift();
};

export function send_text(oParam){
    // toLog('数据', oParam);
    task_line.push(oParam);
    return oParam;
}

