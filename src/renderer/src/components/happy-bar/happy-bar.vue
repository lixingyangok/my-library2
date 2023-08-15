<!--
 * @Author: 李星阳
 * @Date: 2023-08-15 20:50:04
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-15 21:02:21
 * @Description: 
-->
<template>
    <article class="happy-bar" >
        <div class="insider">

        </div>
    </article>
</template>

<script setup>

import { reactive, ref, watchEffect } from 'vue'
const oProps = defineProps({
    iCounter: Number,
});


const motion = reactive({
    isRunning: false,
    iBegin: 0,
});

watchEffect(()=>{
    console.log('oProps ★', oProps.iCounter);
});


// watch()


</script>

<style src="./style/happy-bar.css" scoped></style>



