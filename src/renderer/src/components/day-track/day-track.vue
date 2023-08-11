<!--
 * @Author: 李星阳
 * @Date: 2023-08-11 19:52:29
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-11 21:45:32
 * @Description: 
-->
<template>
    <div class="day-track-body" >
        <ol class="hours">
            <li v-for="iHour of 24" :key="iHour" >
                <span>{{ iHour-1 }}</span>
            </li>
        </ol>
        <ul class="day-ul">
            <li v-for="(cur, idx) of aDayAction" :key="idx" 
                :style="{
                    left: `${cur.iPercentOfDay01}%`,
                    width: `${cur.iLongPercent}%`,
                }"
                :duration="cur.duration"
                :qty="cur.qty"
            >
            </li>
        </ul>
        
    </div>
</template>
<style src="./style/day-track.css" scoped></style>

<script>
import oMethod from './js/day-track.js';

export default {
    name: 'day-track',
    data(){
        const oResult = {
            aDayAction: [],
        };
        return oResult;
    },
    created(){
        this.init();
    },
    methods: {
        ...oMethod,
    },
}
</script>




