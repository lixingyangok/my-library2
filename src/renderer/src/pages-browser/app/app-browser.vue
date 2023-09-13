<!--
 * @Author: 李星阳
 * @Date: 2023-09-10 17:12:37
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-10 19:59:50
 * @Description: 
-->
<template>
    <div class="page-body">
        <h1>
            <time>{{ sTime }}</time>
        </h1>
        <p>Ran times: {{iRanTimes}}</p>
        <ul class="speak-history">
            <li v-for="(cur, idx) of aSpeakHistory" :key="idx" >
                {{ cur }}
            </li>
        </ul>
    </div>
</template>

<script>
import all_fn from './js/app-browser.js';

export default {
    data(){
        return {
            sTime: '',
            iRanTimes: 0,
            aSpeakHistory: [],
        };
    },
    async created(){
        this.setTime();
        const this_=this;
        setInterval(()=>{
            this_.iRanTimes++;
            this_.getText();
        }, 300);
    },
    methods:{
        ...all_fn,

    },
}
</script>

<style src="./style/app-browser.css"> </style>
