/*
 * @Author: 李星阳
 * @Date: 2023-08-15 22:37:14
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-17 22:27:26
 * @Description: 
 */


import { defineStore } from 'pinia';
import {ref} from 'vue';

export const useBarInfo = defineStore('barInfo', ()=>{
    const iCount = ref(0);
    const iDurationSec = ref(0); // 持续时间
    const iAllSec = ref(0);
    const isRunning = ref(false);
    const setStatus = (bVal, iDurationVal=0)=>{
        if (!bVal) iDurationSec.value = iDurationVal; 
        // 👆放在顶部执行 👇因为这一行引发的动作会调用上一行的值
        isRunning.value = !!bVal;
        if (!iDurationVal) return;
        iCount.value++;
        iAllSec.value += iDurationVal;
    };
    return {
        iCount,
        isRunning,
        iDurationSec,
        iAllSec,
        setStatus
    };
});



