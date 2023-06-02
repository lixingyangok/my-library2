<!--
 * @Author: 李星阳
 * @Date: 2022-04-15 18:02:43
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-06-02 21:42:11
 * @Description: 
-->
<template>
    <div class="today-bar" >
        今日成就：
        <div class="cell" >
            录入时长：
            <ul class="lights" >
                <li v-for="idx, of 10" :key="idx"
                    :class="{lighting: ~~(oInfo.iFiDuration / 60) >= idx}"
                    :name="idx"
                ></li>
            </ul>
            <em>{{oInfo.sFiDuration}}</em>
            <b class="addition" v-if="oInfo.iFiDuration_">{{oInfo.iFiDuration_}}</b>
        </div>
        <span class="cell"  @click="showUp" >
            录入行数：<em>{{oInfo.iFilled}}行</em>
            <b class="addition" v-if="oInfo.iFilled_">{{oInfo.iFilled_}}</b>
        </span>
        <span class="cell" >
            录入词汇：<em>{{oInfo.iFilledWords}}个</em>
            <b class="addition" v-if="oInfo.iFilledWords_">{{oInfo.iFilledWords_}}</b>
        </span>
        --&emsp;
        <span class="cell" >
            创建行数：<em>{{oInfo.iCreated}}行</em>
            <b class="addition" v-if="oInfo.iCreated_">{{oInfo.iCreated_}}</b>
        </span>
        <span class="cell" >
            创建时长：<em>{{oInfo.sCrDuration}}</em>
            <b class="addition" v-if="oInfo.iCrDuration_">{{oInfo.iCrDuration_}}</b>
        </span>
    </div>
</template>

<script setup>
import {reactive, ref} from 'vue';
import {getTodayHistory} from '@/common/js/fs-fn.js';

let oInfo = ref({});
const oData = reactive({
    showAnimation: false,
    isFirstRun: true,
});

init();
async function init(){
    const oRes = await getTodayHistory();
    if (!oRes) return;
    if (oData.isFirstRun){
        oData.isFirstRun = false;
        oInfo.value = oRes;
        return;
    }
    console.log('\nes●\nes●\nes●\nes●');
    console.log(oRes.$dc());
    setValue(oRes);
}

function setValue(oRes){
    Object.entries(oRes).forEach(([key, val])=>{
        const sKeyNew = `${key}_`;
        const iAddition = val - oInfo.value[key];
        oInfo.value[key] = val;
        oInfo.value[sKeyNew] = iAddition > 0 ? iAddition : 0;
    });
    setTimeout(()=>{
        Object.keys(oInfo.value).forEach((key)=>{
            if (!key.endsWith('_')) return;
            oInfo.value[key] = 0;
        });
    }, 2 * 1000);
}

function showUp(){
    init();
    console.log('hello');
}

//关键点 把方法暴露给父组件
defineExpose({
    init,
});
</script>

<style lang="scss" src="./style/today-history.scss" scoped ></style>
