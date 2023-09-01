<!--
 * @Author: 李星阳
 * @Date: 2021-12-02 20:27:04
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-06 18:31:34
 * @Description: 
-->

<template>
    <section class="outer" >
        <h2>{{aDisks}}</h2>
        <ul class="path-list" >
            <li v-for="(cur, idx) of oConfig.aRoot" :key="idx"
                :class="{active: aPath.join('/').startsWith(cur)}"
            >
                <span class="folder" @click="choseRoot(cur)">
                    {{cur}}
                </span>
                &nbsp;
                <el-button link type="primary" @click="showDialog(cur)">
                    弹出窗口
                </el-button>
            </li>
        </ul>
        <p>
            当前：{{aPath.join('/')}}<br/>
            目标：{{this.$route.query.sPath}}
        </p>
        <div class="legend" >
            图标含义：
            文件夹/内含媒体/媒体已入库：
            <i class="folder-mark fas fa-folder"/>
            &nbsp;<i class="folder-mark fas fa-folder has-media"/> 
            &nbsp;<i class="folder-mark fas fa-folder has-media"/><i class="fas fa-check fa-xs small-check"/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            媒体文件/已入库/已完成：
            <i class="fas fa-play-circle " />
            &nbsp;<i class="fas fa-play-circle doing" />
            &nbsp;<i class="fas fa-play-circle done" />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            文件路径/名称与数据库不符 <i style="color:red">红字</i>
        </div>
        <div>
            <button @click="updateMediaInfo">更新异常文件</button>
        </div>
        <br/>
        <!-- ▼大列表 -->
        <article class="directory-list">
            <ul v-for="(aColumn, i1) of aTree" :key="i1">
                <li v-for="(cur, i2) of aColumn" :key="i2"
                    @click="ckickTree(i1, i2, cur)"
                    class="one-item"
                    :class="{
                        active: cur.sItem == aPath[i1+1],
                        'name-wrong': cur.isMedia && cur.infoAtDb && !cur.bNameRight,
                    }"
                >
                    <template v-if="cur.isDirectory">
                        <i class="folder-mark fas fa-folder "
                            :class="{'has-media': cur.hasMedia}"
                        />
                        <i class="fas fa-check fa-xs small-check"
                            v-if="oMediaHomes[cur.sPath]"
                        />
                    </template>
                    <template v-else-if="cur.isMedia">
                        <i class="fas fa-play-circle"
                            :class="{
                                doing: cur.infoAtDb,
                                done: cur.infoAtDb?.finishedAt,
                            }"
                        />
                    </template>
                    <i v-else class="fas fa-file-alt"/>
                    <!-- 左右分界 -->
                    <el-popover v-if="cur.isMedia" placement="right" trigger="hover" 
                        :width="300"
                    >
                        <template #reference>
                            <span class="item-name" :hash="cur.hash">
                                {{cur.sItem}}
                            </span>
                        </template>
                        <p>{{cur.sItem}}</p>
                        <p>hash: {{cur.hash}}</p>
                        <el-button type="primary" link :key="`${i1}-${i2}`"
                            @click="checkDetail(cur)"
                        >
                            详情
                        </el-button >
                    </el-popover>
                    <span class="item-name" v-else>
                        {{cur.sItem}}
                    </span>
                </li>
            </ul>
        </article>
    </section>
    <!-- 
        ▼弹窗 ▼弹窗 ▼弹窗
    -->
    <el-dialog title="初始化" width="960px"
        v-model="dialogVisible"
    >
        <el-tree node-key="sPath" default-expand-all
            :data="aFolders" :expand-on-click-node="false"
        >
            <template #default="{ node, data }">
                <span class="tree-line">
                    <span class="label" :title="node.label">
                        {{ node.label }}
                    </span>
                    <span v-if="data.hasMedia" class="right-info">
                        <el-progress class="progress-bar" :show-text="false"
                            :percentage="Math.min(100, ((oMediaHomes[data.sPath] || 0) / data.hasMedia) * 100)" 
                        />
                        <span class="count" :class="{full: data.hasMedia==oMediaHomes[data.sPath]}">
                            {{`${oMediaHomes[data.sPath] || 0}/${data.hasMedia}`}}
                        </span>
                        <el-button link type="primary" @click="checkFolder(data)">
                            实施入库
                        </el-button>
                    </span>
                </span>
            </template>
        </el-tree>
        <!-- ▼按钮▼ -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">
                    Cancel
                </el-button>
                <el-button type="primary" @click="dialogVisible = false">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
    <!-- ▼弹窗 -->
    <!-- ▼文件夹的【媒体列表】 -->
    <el-dialog title="初始化" width="550px"
        v-model="bMediaDialog"
    >
        <h3> {{fucousFolder}} </h3>
        <br/>
        <ul class="media-list-in-dialog" >
            <li v-for="(cur,idx) of aFolderMedia" :key="idx"
                class="one-media"
            >
                <span class="name" :title="cur.name">
                    {{cur.name}}
                </span>
                <span class="status">
                    媒体/字幕：
                    <i :class="{'no-yet': cur.hash && !cur.infoAtDb}" >
                        {{cur.infoAtDb ? '✔' : '✘'}}
                    </i>
                    <i :class="{'no-yet': !oLineMap[cur?.infoAtDb?.id], 'no-srt': !cur.srt}">
                        {{ 
                            oLineMap[cur?.infoAtDb?.id] 
                            ? `✔${oLineMap[cur?.infoAtDb?.id]}`
                            : '✘'
                        }}
                    </i>
                </span>
            </li>
        </ul>
        <br/>
        <el-button type="primary" @click="saveOneByOne">
            入库
        </el-button>
        <!-- ▼按钮▼ -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="bMediaDialog = false">
                    Cancel
                </el-button>
                <el-button type="primary" @click="bMediaDialog = false">
                    Confirm
                </el-button>
            </span>
        </template>
    </el-dialog>
    <!-- ▼媒体详情窗口 -->
    <el-dialog title="初始化" width="550px"
        v-model="oMediaInfo.isShow"
    >
        <section class="media-info" >
            <h5> name: {{ oMediaInfo.oMedia.name || '无，或许已被删除' }} </h5>
            <p> createdAt: {{ oMediaInfo.oMedia.createdAt }} </p>
            <p> dir: {{ oMediaInfo.oMedia.dir }} </p>
            <p> id: {{ oMediaInfo.oMedia.id }} </p>
        </section>
        <section class="new-words">
            <ul v-if="oMediaInfo.aWords.length" >  
                <li v-for="(cur, idx) of oMediaInfo.aWords" :key="idx">
                    {{ cur.word }}
                </li>
            </ul>
            <p v-else >
                暂无收录词汇
            </p>
        </section>
        <p>
            当前媒体行数量：{{ oMediaInfo.aLines.length }}
        </p>
        <ul class="media-all-line" >
            <li v-for="(cur, idx) of oMediaInfo.aLines" :key="idx" >
                {{ String(idx+1).padStart(2, '0') }}_{{ cur.text }}
            </li>
        </ul>
        <section class="btn-group" >
            <el-button type="primary">
                占位
            </el-button>
            <el-button type="danger" @click="toForgetMedia(oMediaInfo.oMedia)">
                删除
            </el-button>
        </section>
    </el-dialog>
</template>

<script>
import oMethods from './js/shelf.js';

export default {
    name: "shelf",
    data(){
        // console.log('vm.$route;\n', this.$route);
        const {aRoot} = window.oConfig;
        const {sPath=''} = this.$route.query;
        let aPath = [aRoot[0]];
        let aAimTo = [];
        for (const cur of aRoot){
            if (!sPath.startsWith(cur)) continue
            aPath = [cur];
            aAimTo = sPath.slice(cur.length + 1).split('/');
        }
        return {
            aFolders: [],
            aFolderMedia: [],
            aDisks: document.body.disks,
            oConfig: window.oConfig,
            aPath,
            aAimTo,
            aTree: [],
            dialogVisible: false, // 用于导入的1级窗口
            bMediaDialog: false,
            aMediaHomes: [],
            // ▼数据库中的数据
            oMediaHomes: {},
            oLineMap: {},
            fucousFolder: '', // 当前入库的目录
            oMediaInfo: {
                isShow: false,
                oMedia: {},
                aLines: [],
                aWords: [],
            },
        };
    },
    created(){
        this.getMediaHomesArr();
    },
    watch: {
        aPath: {
            deep: true,
            immediate: true,
            handler(aNewVal){ // 页面加载时会执行
                this.getDirChildren();
            },
        },
    },
    methods: {
        ...oMethods,
    },
};
</script>

<style scoped src="./style/shelf.scss" lang="scss"></style>
<style scoped src="./style/media-info.css"></style>


