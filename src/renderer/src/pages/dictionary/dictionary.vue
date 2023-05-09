<!--
 * @Author: 李星阳
 * @Date: 2022-01-23 18:49:41
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-05-09 22:14:19
 * @Description: 
-->
<template>
    <article v-show="!beDialog || isShowSelf"
        class="outer-dom" :style="{'--top': oStyle.topVal}"
    >
        <component width="1000px"
            v-model="isShowSelf"
            :top="oStyle.topVal"
            :class="beDialog ? 'dialog-model': 'dict_model'"
            :is="beDialog ? 'el-dialog' : 'div'"
            :title="beDialog ? '查字典' : ''"
            :style="beDialog ? {'margin-bottom': 0} : {}"
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
            <section class="tabs_wrap" ref="oTab">
                <el-tabs v-model="activeName" @tab-click="handleClick" >
                    <el-tab-pane label="本地" name="A1">
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
                    <el-tab-pane label="百度" name="A2">
                        <div class="site baidu">百度</div>
                    </el-tab-pane>
                    <el-tab-pane label="朗文" name="A3">角色管理</el-tab-pane>
                    <el-tab-pane label="剑桥" name="A4">定时任务补偿</el-tab-pane>
                </el-tabs>
            </section>
        </component>
    </article>
</template>

<script setup>
import { ref, computed, watch, reactive, onMounted, onBeforeUnmount } from 'vue';
import { splitSentence, groupThem, afterOpened, handleClick } from './js/dictionary.js';
import {secToStr} from '@/common/js/pure-fn.js';

const props = defineProps({
    dialogVisible: Boolean,
    beDialog: Boolean,
    word: { type: String, default: '', },
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
const activeName = ref('A2');
const oTab = ref();
const oStyle = reactive({
    topVal: '3vh',
});

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

function getPosition(oDom){
    const oDiv = oDom.querySelectorAll('.el-tabs__content')[0];
    // const {offsetTop, offsetLeft, offsetWidth, offsetHeight} = oDiv;
    const oInfo = oDiv.getBoundingClientRect();
    console.log('oDivvvv', oDiv);
    console.log(oInfo);
    fnInvoke('BrowserView', 'show', {
        x: oInfo.x + 1,
        y: oInfo.y + 1,
        width: oInfo.width -2,
        height: oInfo.height -2,
        // url: 'https://fanyi.baidu.com/#en/zh/',
        url: 'https://fanyi.baidu.com/#zh/en/%E5%9D%9A%E6%8C%81%E4%B8%8B%E5%8E%BB',
    });
}

onMounted(()=>{
    setTimeout(()=>{
        props.beDialog || getPosition(oTab.v);
        // getPosition(oTab.v);
    }, 100);
});
onBeforeUnmount(()=>{
    fnInvoke('BrowserView', 'hide');
});

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
