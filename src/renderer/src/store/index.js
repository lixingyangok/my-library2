/*
 * @Author: 李星阳
 * @Date: 2023-08-12 12:05:57
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-20 12:30:23
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
            // if (this.count % 2) return;
            const sToday = moment().format('yyyy-MM-DD');
            const sql = `
                SELECT
                    mediaId, lineId, playFrom, playEnd, action,
                    datetime(actionBegin, 'localtime') as actionBeginAt,
                    datetime(createdAt, 'localtime') as actionEndAt,
                    strftime('%f', createdAt) - strftime('%f', actionBegin) as duration1,
                    (
                        strftime('%s', createdAt) - strftime('%S', createdAt) + strftime('%f', createdAt) -
                        (strftime('%s', actionBegin) - strftime('%S', actionBegin) + strftime('%f', actionBegin))
                    ) as duration
                from action
                where actionBeginAt like '${sToday}%'
                order by actionBeginAt
            `;
            const [aResult] = await fnInvoke('db', 'doSql', sql);
            // console.log('aResult', aResult);
            this.processMinites(aResult);
        },
        async processMinites(aResult){
            const sToday = moment().format('yyyy-MM-DD') + ' 00:00:00';
            const oZeroClock = moment(sToday);
            const aFixed = [];
            aResult.forEach((oCur, idx) => {
                const {actionBeginAt, actionEndAt} = oCur;
                let oLast = aFixed.at(-1);
                const oActionBeginAt = moment(actionBeginAt);
                const iMinutesStart = oActionBeginAt.diff(oZeroClock, 'minute');
                const iGap2PrevSec = oLast?.actionEndAt && oActionBeginAt.diff(oLast.actionEndAt, 'second');
                const pushNewOne = (idx==0) || (iGap2PrevSec > 60);
                if (pushNewOne){
                    oLast = {
                        actionBeginAt, // 行动起点
                        iMinutesStart, // 行动起点（分数序号
                        leftAt: iMinutesStart / iOneDayMinites * 100,
                    };
                }
                oLast.iGap2PrevSec = iGap2PrevSec; // 目前没用，将来用于数据分析
                oLast.actionQty = (oLast.actionQty || 0) + 1; // 目前没用，将来用于数据分析
                oLast.iMinutesLong = (()=>{ // 计算最左到最右的距离
                    let second = moment(actionEndAt).diff(oLast.actionBeginAt, 'second');
                    return Math.max(1, second / 60); // 最小1分钟
                })();
                oLast.actionEndAt = actionEndAt; // 行动终点
                oLast.duration = (oLast.duration || 0) + oCur.duration;
                oLast.height = oLast.duration / (oLast.iMinutesLong * shortMinutes) * 100,
                oLast.width = oLast.iMinutesLong / iOneDayMinites * 100;
                // oLast.saturation = oLast.duration / (iMinutesLong * shortMinutes); // 时长饱和度百分数
                // oLast.kids = (oLast.kids || []).contract(oCur); // 当前没用上
                // console.log(`饱和分-秒 ${iMinutesLong}-${oLast.duration.toFixed(0)} -${oLast.saturation}`);
                pushNewOne && aFixed.push(oLast);
            });
            console.log(`播放记录 #${this.count} 合并前后数量：${aResult.length}:${aFixed.length}`);
            this.aTodayAction = aFixed;
        },
    },
});

// export default {
//     computed: {
//         // 注意，我们不是在传递一个数组，而是一个接一个的 store。
//         // 可以 id+'Store' 的形式访问每个 store 。
//         ...mapStores(useActionStore)
//     },
//     methods: {
//         async buyStuff() {
//             console.log('buyStuff');
//             // 可以在任何地方使用他们！
//             // if (this.userStore.isAuthenticated()) {
//             //     await this.cartStore.buy()
//             //     this.$router.push('/purchased')
//             // }
//         },
//     },
// }




