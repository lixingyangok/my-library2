/*
 * @Author: 李星阳
 * @Date: 2023-08-12 12:05:57
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-13 23:29:14
 * @Description: 
 */

import { mapStores, defineStore } from 'pinia';
const moment = require('moment');
const iOneDayMinites = 24 * 60; // 全天分钟数
const shortMinutes = 50; // 短分钟（每分钟播放达到此秒数即视为100%高饱和）

// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)
// 第一个参数是你的应用中 Store 的唯一 ID。

export const useActionStore = defineStore('action', {
    state: () => ({ 
        count: 1,
        aTodayAction: [], // 当天记录
        aDaysAction: [], // 多天记录
    }),
    getters: {
        double: (state) => state.count * 2,
    },
    actions: {
        async init(){
            this.count++;
            if (this.count % 2) return;
            const sToday = moment().format('yyyy-MM-DD');
            // gapToPrev 这个属性好像查出来也没
            const sql = `
                SELECT
                    mediaId, lineId, playFrom, playEnd, duration, action,
                    datetime(action.actionBegin, 'localtime') as actionBeginAt,
                    datetime(action.actionEnd, 'localtime') as actionEndAt
                from action
                where actionBeginAt like '${sToday}%'
                order by actionBeginAt
            `;
            const [aResult] = await fnInvoke('db', 'doSql', sql);
            // this.processData(aResult);
            this.processMinites(aResult);
        },
        async processMinites(aResult){
            const sToday = moment().format('yyyy-MM-DD') + ' 00:00:00';
            const oZeroClock = moment(sToday);
            const aFixed = [];
            aResult.forEach((oCur, idx) => {
                const {actionBeginAt, actionEndAt} = oCur;
                const oLast = aFixed.at(-1);
                const oActionBeginAt = moment(actionBeginAt);
                const iMinutesStart = oActionBeginAt.diff(oZeroClock, 'minute');
                const iGap2PrevSec = oLast?.actionEndAt ? oActionBeginAt.diff(oLast?.actionEndAt, 'second') : null;
                if ((idx==0) || (iGap2PrevSec > 60)){
                    const oMinites = {
                        actionBeginAt,
                        actionEndAt,
                        iMinutesStart, // 分数序号起点
                        iMinutesEnd: iMinutesStart, // 分钟终点
                        iMinutesLong: 1, // 默认值：计1分钟
                        actionQty: 1, // 动作次数
                        leftAt: iMinutesStart / iOneDayMinites * 100,
                        duration: oCur.duration,
                        kids: [oCur],
                        width: 1 / iOneDayMinites * 100,
                        height: oCur.duration / 60 * 100, // 100% 高
                        level: 0.3,
                    };
                    oMinites.iGap2PrevSec = iGap2PrevSec;
                    return aFixed.push(oMinites);
                }
                const iMinutesLong = (()=>{
                    let second = moment(actionEndAt).diff(oLast.actionBeginAt, 'second');
                    // let intMinutes = Math.round(second / 60);
                    return Math.max(1, second / 60); // 最小1分钟
                })();
                // console.log('秒分：', moment(actionEndAt).diff(oLast.actionBeginAt, 'second'), iMinutesLong, )
                // console.log('iMinutesLong', iMinutesLong);
                oLast.actionEndAt = actionEndAt;
                oLast.iGap2PrevSec = iGap2PrevSec;
                oLast.iMinutesLong = iMinutesLong;
                oLast.iMinutesEnd = iMinutesStart;
                oLast.duration += oCur.duration;
                oLast.actionQty += 1;
                // if (oLast.duration > (iMinutesLong * 60)){ // 将来删除
                //     oLast.duration = (iMinutesLong * 60) * 0.5;
                // }
                oLast.saturation = oLast.duration / (iMinutesLong * shortMinutes); // 时长饱和度百分数
                oLast.height = oLast.saturation * 100;
                oLast.width = iMinutesLong / iOneDayMinites * 100;
                oLast.kids.push(oCur);
                // oLast.level = 1-(iMinutesLong * 0.05);
                // oLast.level += oLast.saturation * 0.5;
                // console.log(`饱和分-秒 ${iMinutesLong}-${oLast.duration.toFixed(0)} -${oLast.saturation}`);
                oLast.level = Math.min(oLast.level, 1); // 早期有些错误，将来去除这一行
            });
            console.log(`播放记录：${aResult.length} - ${aFixed.length}`);
            this.aTodayAction = aFixed;
        },
    },
});

export default {
    computed: {
        // 注意，我们不是在传递一个数组，而是一个接一个的 store。
        // 可以 id+'Store' 的形式访问每个 store 。
        ...mapStores(useActionStore)
    },
    methods: {
        async buyStuff() {
            console.log('buyStuff');
            // 可以在任何地方使用他们！
            // if (this.userStore.isAuthenticated()) {
            //     await this.cartStore.buy()
            //     this.$router.push('/purchased')
            // }
        },
    },
}








