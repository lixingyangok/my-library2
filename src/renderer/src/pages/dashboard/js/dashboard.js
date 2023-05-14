import * as echarts from 'echarts';
const fsp = require('node:fs/promises');
const dayjs = require("dayjs");
const isoWeek = require('dayjs/plugin/isoWeek');
dayjs.extend(isoWeek);
const sPath = 'D:/Program Files (gree)/my-library/baidu_translate';

const reportFn = {
    getOneDay(iDaysAgo){
        const oNow = dayjs();
        const oTheDay = oNow.subtract(iDaysAgo, 'day');
        const sTheDay = oTheDay.format('YYYY-MM-DD');
    },
};

export default {
    async init(){
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
        const oDateNow = new Date();
        const oDateToday = new Date(oDateNow.getFullYear(), oDateNow.getMonth(), oDateNow.getDate());
        // Monday = 1 by isoWeekday()
        const o1stDayOfThisWeek = oNow.subtract(oNow.isoWeekday()-1, 'day').set('hour', 0).set('minute', 0).set('second', 0).toDate();
        const oStartDay = dayjs('2023-02-12 23:59:59'); // 周日24点之后开始使用百度翻译
        const aText = sText.split(/\s*\n\s*/);
        const aRow = aText.map(cur=>{
            const aSplited = cur.split('\t');
            const createdAt = aSplited[5];
            const createdAtShort = createdAt.slice(0,10);
            const createdAtDate = new Date(createdAtShort);
            const oCreatedAt = dayjs(createdAt, 'YYYY-MM-DD HH:mm:ss');
            const isAfterThat = oCreatedAt.isAfter(oStartDay);
            const obj01 = { // idx: aSplited[0], definition: aSplited[3],
                from: aSplited[1],
                to: aSplited[2],
                direction: aSplited[4],
                // createdAt,
                createdAtShort,
            };
            if (isAfterThat){
                const o1stDayOfThatWeekOBJ = oCreatedAt.subtract(oCreatedAt.isoWeekday()-1, 'day'); //.set('hour', 0).set('minute', 0).set('second', 0).toDate();
                const o1stDayOfThatWeek = o1stDayOfThatWeekOBJ.set('hour', 0).set('minute', 0).set('second', 0).toDate();
                const sYearWeek = `${createdAt.slice(0,4)} w${String(oCreatedAt.isoWeek()).padStart(2, '0')}`;
                Object.assign(obj01, {
                    isAfterThat,
                    sYearWeek,
                    weekBegin: o1stDayOfThatWeekOBJ.format('YYYY-MM-DD'),
                    dayOfWeek: oCreatedAt.isoWeekday(),
                    daysAgo: getGapDays(createdAtDate, oDateToday),
                    weeksAgo: getGapWeeks(o1stDayOfThisWeek, o1stDayOfThatWeek),
                    monthsAgo: getGapMonths(createdAtDate, oDateToday),
                });
            }
            return obj01;
        });
        this.aAllWords = aRow;
        // console.log(aRow.slice(-30));
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
    let aWeekListFull = new Set([]);
    const series = [];
    const filtered = aData.filter(cur => {
        if (!cur.isAfterThat || (cur.weeksAgo >= iWeeks)) return false;
        const {dayOfWeek, sYearWeek, weekBegin} = cur;
        // if (1 || sYearWeek == '2023 w17') arr.push(cur.$dc())
        aWeekListFull.add(sYearWeek + '\n' + weekBegin); //  + '\n' + weekBegin
        series[dayOfWeek-1] ||= {...structuredClone(oCommonPart), name: `D${dayOfWeek}`};
        series[dayOfWeek-1].data_obj[sYearWeek] ??= 0;
        series[dayOfWeek-1].data_obj[sYearWeek]++;
        return true;
    });
    // console.log('过滤之后');
    // console.table(filtered.$dc().slice(-300));
    aWeekListFull = [...aWeekListFull].sort();
    let aWeekList = aWeekListFull.map(cur=>cur.split('\n')[0]);
    series.forEach(cur=>{
        const {data_obj} = cur;
        cur.data = aWeekList.map(sWeek => {
            return data_obj[sWeek] || 0;
        });
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
    // console.log('series', series);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
            },
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
            data: aWeekListFull, //aWeekList,
        },
        series: [{
            name: 'D7',
            type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: [820, 832, 901, 934, 1290, 1330, 1320]
        }],
    };
    option.series = series;
    return option;
}

// ▼计算月份差
function getGapMonths(startDate, endDate) {
    const [start, end] = [startDate, endDate];
    const years = end.getFullYear() - start.getFullYear();
    const months = years * 12 + end.getMonth() - start.getMonth();
    return months;
}

// ▼计算天数差
function getGapDays(oTime01, oTime02) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(oTime01.getFullYear(), oTime01.getMonth(), oTime01.getDate());
    const utc2 = Date.UTC(oTime02.getFullYear(), oTime02.getMonth(), oTime02.getDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

// ▼计算星期差
function getGapWeeks(startMonday, endMonday) {
    const _7DaysLong = 1000 * 60 * 60 * 24 * 7;
    const diff = Math.abs(startMonday.getTime() - endMonday.getTime());
    const weeks = Math.floor(diff / _7DaysLong);
    return weeks;
}



// ▼每行都有5个制表键，无例外
// aText.forEach(cur=>{
//     const iLen = cur.match(/\t/g).length;
//     if (iLen != 6) console.log('iLen',iLen);
// });

// console.log(dayjs().isoWeek()); // 周之于年
// console.log(dayjs().isoWeekday()); // 日之于周
// console.log(dayjs().isoWeekYear()); // 年