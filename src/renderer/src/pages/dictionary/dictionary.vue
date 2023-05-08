<!--
 * @Author: 李星阳
 * @Date: 2022-01-23 18:49:41
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-08 21:14:18
 * @Description: 
-->
<template>
    <article class="outer-dom" v-show="!beDialog || isShowSelf">
        <component v-model="isShowSelf"
            top="3vh"
            width="1000px"
            class="dialog-clothes"
            :is="beDialog ? 'el-dialog' : 'div'"
            :title="beDialog ? '查字典' : ''"
            @opened="afterOpened"
        >
            <div class="search-bar">
                <input v-model="sKey" @input="toSearch"/>
                <button @click="toSearch">
                    搜索
                </button>
                <!-- <button Aclick="toSearch"> 全字匹配 </button> -->
                <span>
                    结果{{iResult}}条
                </span>
            </div>
            <!-- ▼结果列表 -->
            <section class="content-box" >
                <el-tabs v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="本地" name="first">
                        <ul class="result-list">
                            <li class="one-dir" v-for="(cur,idx) of aResult" :key="idx">
                                <h3 class="dir-name" >{{cur.dir.split('/').slice(2).join(' > ')}}</h3>
                                <ul class="one-file" >
                                    <li class="one-sentence" v-for="(item, i02) of cur.aList" :key="i02">
                                        <h4 class="file-name" v-if="(i02 === 0) || item.name != cur.aList[i02-1].name">
                                            {{item.name}}
                                        </h4>
                                        <p title="secToStr(item.start)">
                                            <time class="start">{{secToStr(item.start)}}</time>
                                            <span class="one-word" :class="{'matched': sWord.word}"
                                                v-for="(sWord, i02) of splitSentence(item.text, sKey || word)" :key="`${idx}-${i02}`"
                                            >
                                                {{sWord.word || sWord}}
                                            </span>
                                        </p>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </el-tab-pane>
                    <el-tab-pane label="百度" name="second">
                        <div class="site baidu">百度</div>
                    </el-tab-pane>
                    <el-tab-pane label="朗文" name="third">角色管理</el-tab-pane>
                    <el-tab-pane label="剑桥" name="fourth">定时任务补偿</el-tab-pane>
                </el-tabs>
            </section>
        </component>
    </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { splitSentence, groupThem, afterOpened, handleClick } from './js/dictionary.js';
import {secToStr} from '@/common/js/pure-fn.js';

const props = defineProps({
    dialogVisible: Boolean,
    beDialog: Boolean,
    word: String,
});
const emit = defineEmits(['update:dialogVisible']);
const isShowSelf = computed({
    get: () => {
        return props.dialogVisible;
    },
    set: val => {
        emit('update:dialogVisible', val);
    },
});

let iSearchingQ = 0;
const sKey = ref(''); // 可填入测试用的搜索关键字
const iResult = ref(0); // 搜索结果数量
const aResult = ref({});
const activeName = ref('first');

// ▼方法
toSearch();
function toSearch(){
    if (props.word.trim()) sKey.v = props.word.trim();
    const sAim = sKey.v;
    if (sAim.length < 2) return (aResult.v = {}); // 返回对象不返回数组？
    (async idx => {
        const sWhere = `WHERE text like '%${sAim}%' and text like '% %'`; // 至少包含1个空格  
        const searchRows = fnInvoke('db', 'doSql', `
			SELECT line.text, line.start, media.id, media.dir, media.name
            FROM line left join media
            ON line.mediaId = media.id ${sWhere}
            ORDER BY media.dir, media.name, line.start
            limit 100
		`);
        const searchCount = fnInvoke('db', 'doSql', `
			SELECT count(*) as iCount FROM line ${sWhere}
		`);
        const oResult = await Promise.all([searchRows, searchCount]);
        if (idx != iSearchingQ) return;
        const [[aRes], [aCount=[]]] = oResult;
        iResult.v = aCount[0]?.iCount;
        const aArr = groupThem(aRes);
        aResult.v = aArr;
    })(++iSearchingQ);
}

watch(
    isShowSelf,
    (newVal, oldVal) => {
        if (!newVal || !props.word.trim()) return;
        toSearch();
    },
);
// fnInvoke(
//     'db', 'searchLineBybWord', sAim,
// ).catch(err => {
//     console.log('查询出错\n', err);
// }).then(res=>{
//     console.log('res')
//     console.log(res)
// })
// COUNT(*) as iCount, 
</script>

<style scoped lang="scss" src="./style/dictionary.scss" ></style>
