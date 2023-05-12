import * as echarts from 'echarts';
const fsp = require('node:fs/promises');
const dayjs = require("dayjs");
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);

const sPath = 'D:/Program Files (gree)/my-library/baidu_translate';




export default {
    async init(){
        console.log('init');
        let aKids = await fsp.readdir(sPath);
        aKids = aKids.filter(cur=>{
            return cur.toLocaleLowerCase().endsWith('.txt');
        });
        const sFile = `${sPath}/${aKids[0]}`;
        const sText = await fsp.readFile(sFile, { encoding: 'utf8' });
        this.processText(sText.trim());
    },
    async processText(sText){
        const oNow = dayjs();
        console.log('现在', oNow);
        const aText = sText.split(/\s*\n\s*/);
        const aRow = aText.map(cur=>{
            const aSplited = cur.split('\t');
            const createdAt = aSplited[5];
            const createdAtShort = createdAt.slice(0,10);
            const oCreatedAt = dayjs(createdAt, 'YYYY-MM-DD HH:mm:ss');
            const sYearWeek = `${createdAt.slice(0,4)} w${String(oCreatedAt.isoWeek()).padStart(2, '0')}`;
            
            return {
                // idx: aSplited[0],
                from: aSplited[1],
                to: aSplited[2],
                // definition: aSplited[3],
                direction: aSplited[4],
                createdAt,
                createdAtShort,
                sYearWeek,
                daysAgo: oNow.diff(oCreatedAt, 'day'),
                weeksAgo: oNow.diff(oCreatedAt, 'week'),
                monthsAgo: oNow.diff(oCreatedAt, 'month'),
                dayOfWeek: oCreatedAt.isoWeekday(),
            };
        });
        this.aAllWords = aRow;
        console.log(aRow.slice(-30));
        this.show_each_day();
    },
    show_each_day(){
        const oBox1 = this.$refs.box1;
        const myChart = echarts.init(oBox1); // 基于准备好的dom，初始化echarts实例
        const oOptions = getDaysData(this.aAllWords);
        myChart.setOption(oOptions); // 绘制图表
    },
}


const oCommonPart = {
    name: 'name',
    type: 'bar',
    stack: 'total',
    label: { show: true },
    emphasis: { focus: 'series' },
    data_obj: {},
    data: [],
};

function getDaysData(aData){
    const iWeeks = 10; // 取近20周数据
    let aWeekList = new Set([]);
    // const oSortByWeek = {};
    const aSortByWeek = [];
    aData = aData.filter(cur => {
        if (cur.weeksAgo > iWeeks) return false;
        const {dayOfWeek, sYearWeek} = cur;
        aWeekList.add(sYearWeek);
        aSortByWeek[dayOfWeek-1] ||= {...oCommonPart, name: `D${dayOfWeek}`};
        return true;
    });
    aWeekList = [...aWeekList].sort();
    console.log('aWeekList', aWeekList);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: {
            type: 'value'
        },
        xAxis: {
            type: 'category',
            // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: aWeekList,
        },
        series: [ {
            name: 'D1',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [320, 302, 301, 334, 390, 330, 320]
        }, {
            name: 'D2',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [120, 132, 101, 134, 90, 230, 210]
        }, {
            name: 'D3',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [220, 182, 191, 234, 290, 330, 310]
        }, {
            name: 'D4',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [150, 212, 201, 154, 190, 330, 410]
        }, {
            name: 'D5',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [820, 832, 901, 934, 1290, 1330, 1320]
        }, {
            name: 'D6',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [820, 832, 901, 934, 1290, 1330, 1320]
        }, {
            name: 'D7',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [820, 832, 901, 934, 1290, 1330, 1320]
        },
    ] };
    return option;
}


// ▼每行都有5个制表键，无例外
// aText.forEach(cur=>{
//     const iLen = cur.match(/\t/g).length;
//     if (iLen != 6) console.log('iLen',iLen);
// });

// console.log(dayjs().isoWeek()); // 周之于年
// console.log(dayjs().isoWeekday()); // 日之于周
// console.log(dayjs().isoWeekYear()); // 年