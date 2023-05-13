<!--
 * @Author: 李星阳
 * @Date: 2021-12-05 17:59:27
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-12 21:25:14
 * @Description: 
-->

<template>
    <div class="page-body" >
        <h1>
            单词数量：{{aAllWords.length.toLocaleString()}}&emsp;
            本月：{{aAllWords.filter(cur=>cur.monthsAgo==0).length}}&emsp;
            本周：{{aAllWords.filter(cur=>cur.weeksAgo==0).length}}&emsp;
            本日：{{aAllWords.filter(cur=>cur.daysAgo==0).length}}&emsp;
        </h1>
        <div class="saved-by-day" ref="box1">

        </div>
    </div>
</template>

<script>
import oMethods from './js/dashboard.js';

export default{
    name: "dashboard",
    data(){
        return {
            aAllWords: [],
        };
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

