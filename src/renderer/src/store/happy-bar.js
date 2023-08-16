/*
 * @Author: 李星阳
 * @Date: 2023-08-15 22:37:14
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-16 23:34:46
 * @Description: 
 */
/*
 * @Author: 李星阳
 * @Date: 2023-08-12 12:05:57
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-13 23:29:14
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
        isRunning.value = !!bVal;
        if (!iDurationVal) return;
        iCount.value++;
        iAllSec.value += iDurationVal;
        if (!bVal) iDurationSec.value = iDurationVal;
    };
    return {
        iCount,
        isRunning,
        iDurationSec,
        iAllSec,
        setStatus
    };
});



