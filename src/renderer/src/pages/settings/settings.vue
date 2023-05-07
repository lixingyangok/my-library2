<!--
 * @Author: 李星阳
 * @Date: 2021-12-05 17:59:27
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-06 19:46:28
 * @Description: 
-->

<template>
    <h1>
        settings
    </h1>
    <textarea>
        hello
    </textarea>
    <iframe title="Inline Frame Example"
        width="300" height="200"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&layer=mapnik">
    </iframe>
    <br/><br/>
    <iframe class="iframe" :src="src"></iframe>
    <!-- <iframe src="https://www.baidu.com/"></iframe> -->
    <!-- <iframe src="https://fanyi.baidu.com"></iframe> -->
    <!-- <a href="https://fanyi.baidu.com" >百度</a>
    <a href="https://fanyi.baidu.com" target="_blank" >百度</a> -->
</template>

<script>
export default{
    data(){
        return {
            src: location.origin + '/#/tools/alarm-clock',
        };
    },
};
</script>

<style scoped lang="scss">
.iframe{
    width: 100%;
    height: 80vh;
}
</style>

