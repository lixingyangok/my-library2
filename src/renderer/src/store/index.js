/*
 * @Author: 李星阳
 * @Date: 2023-08-12 12:05:57
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-12 13:29:00
 * @Description: 
 */

import { mapStores, defineStore } from 'pinia';
const moment = require('moment');
const iGap = 9;
const iOneDaySeconds = 24 * 60 * 60; // 全天秒数

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
            const sToday = moment().format('yyyy-MM-DD') + ' 00:00:00';
            // const iTodayBegan = new Date(sToday + ' 00:00:00') * 1;
            const sql = `
                SELECT
                    mediaId, lineId, playFrom, playEnd, duration, action, gapToPrev,
                    datetime(action.actionBegin, 'localtime') as actionBeginAt,
                    datetime(action.actionEnd, 'localtime') as actionEndAt
                from action
                where actionBeginAt like '${sToday.slice(0,10)}%'
                order by actionBeginAt
            `;
            const [aResult] = await fnInvoke('db', 'doSql', sql);
            this.processData(aResult);
        },
        // ▼加工数据
        processData(aResult){
            const sToday = moment().format('yyyy-MM-DD') + ' 00:00:00';
            const oZeroClock = moment(sToday);
            const aFixed = [];
            aResult.forEach((oCur, idx) => {
                // const oLast = aResult[idx-1];
                const oActionBegin = moment(oCur.actionBeginAt);
                const iSecOfDay = oActionBegin.diff(oZeroClock, 'seconds');
                oCur.iSecOfDay = iSecOfDay;
                oCur.iPercentOfDay01 = (iSecOfDay / iOneDaySeconds * 100).toFixed(5);
                if (idx==0) {
                    return aFixed.push(oCur);
                }
                let oPre = aFixed.at(-1);
                if (oCur.gapToPrev && oCur.gapToPrev < iGap){
                    // ▼ 3参传 true 得到浮点数
                    oPre.duration = moment(oCur.actionEndAt).diff(oPre.actionBeginAt, 'second', true);
                    oPre.actionEndAt = oCur.actionEndAt;
                    oPre.iLongPercent = (oPre.duration / iOneDaySeconds * 100).toFixed(2);
                    oPre.qty = (oPre.qty || 1) + 1;
                }else{
                    oCur.iLongPercent = (oCur.duration / iOneDaySeconds * 100).toFixed(2);
                    aFixed.push(oCur);
                }
                return oCur;
            });
            console.log(`Action 数量：${aResult.length} => ${aFixed.length}`);
            // console.log('aFixed：', aFixed);
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








