const dayjs = require("dayjs");

export default {
    getOneDay(){
        const oNow = dayjs();
        const oTheDay = oNow.subtract(this.iDaysAgo, 'day');
        const sTheDay = oTheDay.format('YYYY-MM-DD');
        return sTheDay;
    },
}
