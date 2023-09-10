<!--
 * @Author: 李星阳
 * @Date: 2023-09-10 17:12:37
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-10 19:24:41
 * @Description: 
-->
<template>
    <div class="page-body">
        <h1>
            <time>{{ sTime }}</time>
        </h1>
    </div>
</template>

<script>
import all_fn from './js/app-browser.js';

export default {
    data(){
        return {
            sTime: '',
        };
    },
    async created(){
        this.setTime();
        setInterval(this.getText, 200);

    },
    methods:{
        ...all_fn,

    },
}
</script>

<style src="./style/app-browser.css">
    
</style>
