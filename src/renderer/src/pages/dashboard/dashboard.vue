<!--
 * @Author: 李星阳
 * @Date: 2021-12-05 17:59:27
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-11 20:00:02
 * @Description: 
-->

<template>
    <div class="page-body" >
        <dayTrack></dayTrack>
        <br/>
        <div class="saved-by-day" ref="box1">

        </div>
        <section class="recent" >
            单词数量：{{aAllWords.length.toLocaleString()}}&emsp;
            本月：{{aAllWords.filter(cur=>cur.monthsAgo==0).length}}&emsp;
            本周：{{aAllWords.filter(cur=>cur.weeksAgo==0).length}}&emsp;
            本日：{{aAllWords.filter(cur=>cur.daysAgo==0).length}}&emsp;
        </section>
        <div>
            <ul>
                <dayReport v-for="(val, idx) of 10" :key="idx"
                    :iDaysAgo="idx"
                    :baiduWords="recentDays"
                />
            </ul>
        </div>
    </div>
</template>

<script>
import oMethods from './js/dashboard.js';
import dayReport from '@/components/day-report/day-report.vue';
import dayTrack from '@/components/day-track/day-track.vue';

const dayjs = require("dayjs");
const oNow = dayjs();
const aDayList = Array(30).fill().map((cur, idx)=>{
    const oDay = oNow.subtract(idx, 'day');
    return oDay.format('YYYY-MM-DD');
});//.reverse();

export default{
    name: "dashboard",
    components: {
        dayReport,
        dayTrack,
    },
    data(){
        return {
            aAllWords: [],
            aDayList,
        };
    },
    computed: {
        recentDays(){
            const aResult = this.aAllWords.filter(cur=> {
                return cur.isAfterThat;
            });
            return aResult;
        },
    },
    async created(){
        this.init();
    },
    methods: {
        ...oMethods,
    },
};
</script>

<style scoped lang="scss" src="./style/dashboard.scss">

</style>

