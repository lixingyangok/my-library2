<!--
 * @Author: 李星阳
 * @Date: 2023-08-15 20:50:04
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-27 21:34:38
 * @Description: 
-->
<template>
    <article class="happy-bar">
        <div class="insider"
            :style="{
                width: `${iLong}%`,
                left: `${iLeftAt}%`,
            }"
            :name="iLong"
        >
            <time class="sec">{{iWentSec.toFixed(1)}}</time>
            
        </div>
        <!-- <el-progress :percentage="percentage" :stroke-width="18" striped123 striped-flow123 :duration="30" :format="showSec" :text-inside="true" /> -->
    </article>
</template>

<script setup>

import { watch, ref } from 'vue';
import {useBarInfo} from '@/store/happy-bar.js';
let iTimer = 0;
const oBarInfo = useBarInfo();
const iLong = ref(0);
const iLeftAt = ref(0);
const iSecRunTimes = 60; // 帧率
const iFreQ = ~~(1000 / iSecRunTimes); // 频率
let iWentMiniSec = 0; // 已运行的“毫秒”
const iWentSec = ref(0); // 已运行的“秒”
let iFarSecGoes = 1; // 每秒前进百分比
const iSecGoesMax = 12; // 每秒前进百分比
// let isRunningInBar = false;

function toRun(){
    clearInterval(iTimer);
    console.log('toRun -----');
    iWentMiniSec = 0;
    iLong.value = 0;
    iLeftAt.value = 0;
    iTimer = setInterval(()=>{
        // isRunningInBar = true;
        iWentMiniSec += iFreQ;
        iWentSec.value = iWentMiniSec / 1000;
        iFarSecGoes = (()=>{
            if (iWentSec.value < 0.3) return iSecGoesMax * 2;
            if (iWentSec.value < 0.6) return iSecGoesMax * 1.5;
            if (iWentSec.value < 1) return iSecGoesMax * 1;
            if (iWentSec.value < 2) return iSecGoesMax * 0.8;
            if (iWentSec.value < 3) return  iSecGoesMax * 0.6;
            if (iWentSec.value < 4) return  iSecGoesMax * 0.4;
            if (iWentSec.value < 5) return  iSecGoesMax * 0.2;
            if (iWentSec.value < 6) return  iSecGoesMax * 0.1;
            return iSecGoesMax * 0.05;
        })();
        iLong.value += (iFarSecGoes / iSecRunTimes);
        if ((iWentSec.value >= 60) || (iLong.value >= 100)){
            toStop(true);
        }
    }, iFreQ);
}
function toStop(iDurationSec){
    clearInterval(iTimer);
    console.log('toStop ---');
    iTimer = setInterval(()=>{
        // if (iDurationSec){
        if (iWentSec.value >= 1){
            if (iLong.value < 100){
                iLong.value += 0.8;
            }
            if (iLeftAt.value < 100){
                iLeftAt.value += 1.8;
            }else{
                clearInterval(iTimer);
                console.log('Stoped');
                iLong.value = 0;
            }
        }else{ // 回退
            if (iLong.value > 0) {
                iLong.value -= 0.8;
            } else {
                clearInterval(iTimer);
                iLong.value = 0;
                iWentSec.value = 0;
            }
        }
    }, iFreQ);
}
function showSec(iVal){
    return iVal+'s';
}

watch(() => oBarInfo.isRunning, (isRunning)=>{
    // else if (isRunningInBar) toStop();
    if (isRunning) return toRun();
    toStop(oBarInfo.iDurationSec);
    console.log(`${oBarInfo.iCount}__${oBarInfo.iDurationSec}__${oBarInfo.iAllSec}`);
});

</script>

<style src="./style/happy-bar.css" scoped></style>



