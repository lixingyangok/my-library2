<template>
    <div>
        <h1>
            h1
        </h1>
    </div>
</template>

<script>
export default {
    async created(){
        await fetch( '/api/send_text',
            {
                method: 'post',
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                    sTime: '呼叫接口时间：' + new Date().toString(), 
                }),
            },
        );
        this.toget();
        this.toget();
    },
    methods:{
        async toget(){
            let oRes = await fetch( '/api/get_text?a=1&b=2',
                {
                    method:'get',
                    headers: { "Content-Type": "application/json"},
                },
            );
            let oData = await oRes.json();
            console.log('oRes', oData.data );
        },
    },
}
</script>

<style>
    
</style>
