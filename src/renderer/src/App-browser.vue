<template>
    <div>
        <h1>
            h1
            <time>{{ sTime }}</time>
        </h1>
    </div>
</template>

<script>
export default {
    data(){
        return {
            sTime: '',
        };
    },
    async created(){
        this.setTime();
        this.toget();
        await fetch('/api/send_text', {
            method: 'post',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                sTime: '呼叫接口时间：' + new Date().toString(), 
            }),
        });
        await fetch('/api/send_text', {
            method: 'post',
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                sTime: '呼叫接口时间：' + new Date().toString(), 
            }),
        });
        this.toget();
    },
    methods:{
        async toget(){
            let oRes = await fetch('/api/get_text?a=1&b=2', {
                method:'get',
                headers: { "Content-Type": "application/json"},
            });
            let oData = await oRes.json();
            console.log('查询结果：', oData.data );
        },
        setTime(){
            const this_ = this;
            setInterval(()=>{
                this_.sTime = new Date().toString();
            }, 1_000);
        },
    },
}
</script>

<style>
    
</style>
