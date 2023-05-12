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
        const o1stDayOfWeek = oNow.subtract(oNow.isoWeekday()-1, 'day');
        const oStartDay = dayjs('2023-02-13 00:00:00'); // 开始使用百度
        console.log('现在', oNow);
        const aText = sText.split(/\s*\n\s*/);
        const aRow = aText.map(cur=>{
            const aSplited = cur.split('\t');
            const createdAt = aSplited[5];
            const createdAtShort = createdAt.slice(0,10);
            const oCreatedAt = dayjs(createdAt, 'YYYY-MM-DD HH:mm:ss');
            const isAfterThat = oCreatedAt.isAfter(oStartDay);
            const obj01 = {
                // idx: aSplited[0],
                from: aSplited[1],
                to: aSplited[2],
                // definition: aSplited[3],
                direction: aSplited[4],
                createdAt,
                createdAtShort,
            };
            if (isAfterThat){
                const oGo1StDayOfWeek = oCreatedAt.subtract(oCreatedAt.isoWeekday()-1, 'day');
                const sYearWeek = `${createdAt.slice(0,4)} w${String(oCreatedAt.isoWeek()).padStart(2, '0')}`;
                Object.assign(obj01, {
                    isAfterThat,
                    sYearWeek,
                    daysAgo: oNow.diff(oCreatedAt, 'day'),
                    weeksAgo: o1stDayOfWeek.diff(oGo1StDayOfWeek, 'week'),
                    monthsAgo: oNow.diff(oCreatedAt, 'month'), //不准确
                    dayOfWeek: oCreatedAt.isoWeekday(),
                });
            }
            return obj01;
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
    const iWeeks = 12; // 取值截止到 x 周前
    let aWeekList = new Set([]);
    const series = [];
    let arr = [];
    const filtered = aData.filter(cur => {
        if (!cur.isAfterThat || (cur.weeksAgo >= iWeeks)) return false;
        const {dayOfWeek, sYearWeek} = cur;
        // if (1 || sYearWeek == '2023 w17') arr.push(cur.$dc())
        aWeekList.add(sYearWeek);
        series[dayOfWeek-1] ||= {...structuredClone(oCommonPart), name: `D${dayOfWeek}`};
        series[dayOfWeek-1].data_obj[sYearWeek] ??= 0;
        series[dayOfWeek-1].data_obj[sYearWeek]++;
        return true;
    });
    console.table(arr);

    console.log('过滤之后', filtered.$dc());
    aWeekList = [...aWeekList].sort();
    console.log('series', series);
    series.forEach(cur=>{
        const {data_obj} = cur;
        cur.data = aWeekList.map(sWeek => {
            return data_obj[sWeek] || 0;
        });
        // cur.label.normal = {
        //     show: true,
        //     position: 'top',
        //     formatter: function (params) {
        //         var total = ['9', '16', '4', '9', '5', '3', '12'];
        //         return '合计：' + total[params.dataIndex];
        //     },
        //     fontSize: 16,
        //     fontWeight: 'bold',
        //     textStyle: { color: '#000' }
        // }
    });
    // series.push({
    //     name: "总计",
    //     type: "bar",
    //     stack: "",
    //     label: {
    //         normal: {
    //             show: true,
    //             position: "top",
    //             color: "#000",
    //             fontSize: 20,
    //         },
    //     },
    //     z: -1,
    //     //不同系列的柱间距离，为百分比,如果想要两个系列的柱子重叠，可以设置 barGap 为 '-100%'。
    //     barGap: "-100%",//柱条间距
    //     data: aWeekList.map(curWeek=>{
    //         return series.reduce((result, cur)=>{
    //             return cur.data_obj[curWeek] + result;
    //         }, 0);
    //     }),
    // });
    console.log('aWeekList', aWeekList);
    console.log('series', series);

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
        series123: [ {
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
        ],
        series,
    };
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