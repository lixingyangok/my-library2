<!--
 * @Author: 李星阳
 * @Date: 2023-08-11 19:52:29
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-15 20:21:08
 * @Description: 
-->
<template>
    <div class="day-track-body" :style="{'--height': `${height}px`}" >
        <ul class="day-ul">
            <li v-for="(cur, idx) of oAction.aTodayAction" :key="idx" 
                :style="{
                    left: `${cur.leftAt}%`,
                    width: `${cur.width}%`,
                    height: Math.max(20, cur.height) + '%',
                    opacity123: cur.level,
                }"
            >
                <span v-show="0"> {{getInfo(cur)}} </span>
            </li>
        </ul>
        <ol class="hours">
            <li v-for="iHour of 24" :key="iHour" >
                <span>{{ iHour-1 }}</span>
            </li>
        </ol>
        <div class="middle-line" :style="oMiddleLineStyle" />
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
    computed: {
        oMiddleLineStyle(){
            const [oFirst] = oAction.aTodayAction;
            if (!oFirst) return {};
            const oLast = oAction.aTodayAction.at(-1);
            return {
                left: `${oFirst.leftAt}%`,
                width: `${oLast.leftAt - oFirst.leftAt + oLast.width}%`,
            };
        },
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




