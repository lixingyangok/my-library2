<!--
 * @Author: 李星阳
 * @Date: 2023-08-11 19:52:29
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-12 13:33:58
 * @Description: 
-->
<template>
    <div class="day-track-body" :style="{'--height': `${height}px`}" >
        <ol class="hours">
            <li v-for="iHour of 24" :key="iHour" >
                <span>{{ iHour-1 }}</span>
            </li>
        </ol>
        <ul class="day-ul">
            <li v-for="(cur, idx) of oAction.aTodayAction" :key="idx" 
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
import {useActionStore} from '@/store/index.js';
const oAction = useActionStore();

export default {
    name: 'day-track',
    props: {
        height: {
            type: Number,
            default: 70,
        },
    },
    data(){
        oAction.init();
        const oResult = {
            aDayAction: [],
            oAction,
        };
        return oResult;
    },
    created(){
        // this.init();
    },
    methods: {
        ...oMethod,
    },
}
</script>




