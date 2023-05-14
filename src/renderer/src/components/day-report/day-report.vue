<template>
    <li class="page-body-li" >
        <h2 class="day-title" >
            📅 <em>{{getOneDay()}}</em> {{ iDaysAgo }} 天之前
        </h2>
        <div>
            <span v-for="(cur, idx) of thisDayWords" :key="idx">
                {{ cur.from }}&nbsp;
            </span>
        </div>
    </li>
</template>

<script>
import methods from './js/day-report.js';

export default{
    name: "day-report",
    props:{
        iDaysAgo: {type: Number},
        baiduWords: {type: Array, default: ()=>[]},
    },
    data(){
        return {
            aAllWords: [],
        };
    },
    computed:{
        thisDayWords(){
            return this.baiduWords.filter(cur=>{
                return cur.daysAgo == this.iDaysAgo;
            });
        },
    },
    async created(){
    },
    methods: {
        ...methods,
    },
};
</script>

<style scoped lang="scss" src="./style/day-report.scss">

</style>