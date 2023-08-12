<!--
 * @Author: 李星阳
 * @Date: 2023-08-11 19:52:29
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-12 19:46:39
 * @Description: 
-->
<template>
    <div class="day-track-body" :style="{'--height': `${height}px`}" >
        <ul class="day-ul">
            <li v-for="(cur, idx) of oAction.aTodayAction" :key="idx" 
                :style="{
                    left: `${cur.leftAt}%`,
                    top: `calc(${(100-cur.height) * 0.5}%)`,
                    width: `${cur.width}%`,
                    height: `${cur.height}%`,
                    opacity: cur.level,
                }"
                :class="`level-${cur.level}`"
            >
                <span v-show="0"> {{getInfo(cur)}} </span>
            </li>
        </ul>
        <ol class="hours">
            <li v-for="iHour of 24" :key="iHour" >
                <span>{{ iHour-1 }}</span>
            </li>
        </ol>
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
        getInfo(obj){
            const newOne = obj.$dc();
            Reflect.deleteProperty(newOne, 'kids');
            return JSON.stringify(newOne);
        },
    },
}
</script>




