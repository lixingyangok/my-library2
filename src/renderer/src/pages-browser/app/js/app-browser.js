/*
 * @Author: 李星阳
 * @Date: 2023-09-10 17:13:28
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-10 20:39:47
 * @Description: 
 */


export default {
    async getText(){
        const oRes = await fetch('/api/get_text', {
            method: 'get',
            headers: { "Content-Type": "application/json"},
        });
        const oData = await oRes.json();
        const {text, announcer} = oData.data;
        if (!text) return;
        this.aSpeakHistory.push(text);
        console.log('=>', text);
        text && toReadAloud(text, announcer);
        return text;
    },
    setTime(){
        const this_ = this;
        setInterval(()=>{
            this_.sTime = new Date().toString();
        }, 1_000);
    },
};



var text = '许多人认为当他们富有，取得成功时，幸福自然就会随之而来。我告诉你:事实并非如此';
var text = 'Many people think that when they become rich and successful, happiness will naturally follow.'; 

function toReadAloud(text){
    window.speechSynthesis.cancel();
    var oMsg = Object.assign(new SpeechSynthesisUtterance(), {
        voice: getVoice(text, 'Jenny'),
        lang: 'zh-CN', // lang 
        volume: 100,
        rate: 1, // 速度
        pitch: 1, // 值大音尖
        text,
    });
    window.speechSynthesis.speak(oMsg);
}

function getVoice(sText, sAnnouncer){
    let aLang = (()=>{
        var en = ['en-US', 'en-GB']; 
        var zh = ['zh-CN']; 
        if (sAnnouncer) return en.concat(zh);
        const isChinese = /[\u4e00-\u9fa5]/.test(sText);
        return isChinese ? zh : en;
    })();
    const aExclude = ['Yunxia', 'Xiaoyi', 'Ana'];
    var aAllVoices = window.speechSynthesis.getVoices();
    var aTargetLang = aAllVoices.filter(cur => aLang.includes(cur.lang));
    aTargetLang = aTargetLang.filter(cur => !aExclude.includes(cur.name));
    var aOnlineService = aTargetLang.filter(cur => !cur.localService);
    var oTarget = (()=>{
        if (!sAnnouncer) return aOnlineService[0];
        var regExp = new RegExp(sAnnouncer, 'i');
        return aOnlineService.find(cur => cur.name.match(regExp));
    })();
    var sPrint = aOnlineService.map(cur=>cur.name.replace('Microsoft ', '')).join('\n');
    console.log(`aOnlineService ■■■■■■■■■■■\n`, sPrint);
    console.log(`oTarget`, oTarget);
    return oTarget;
}



// window.speechSynthesis.speak(oMsg);
// window.speechSynthesis.getVoices()
// window.speechSynthesis.cancel();
// window.speechSynthesis.pause();
// window.SpeechSynthesis.resume()




// ▼微软语音
var aList = [
    "Microsoft Christopher Online (Natural) - English (United States)", // 男
    "Microsoft Eric Online (Natural) - English (United States)", // 男
    "Microsoft Guy Online (Natural) - English (United States)", // 男，感情激昂
    "Microsoft Roger Online (Natural) - English (United States)", // 男，感情
    "Microsoft Steffan Online (Natural) - English (United States)", // 男，感情
    "Microsoft Jenny Online (Natural) - English (United States)", // 女 2021 年，微软推出了 Jenny Multilingual 具备“自动语言预测功能
    "Microsoft Michelle Online (Natural) - English (United States)", // 女
    "Microsoft Aria Online (Natural) - English (United States)", // 女
    // 
    "Microsoft Yunxi Online (Natural) - Chinese (Mainland)", // 男，常见播音
    "Microsoft Yunjian Online (Natural) - Chinese (Mainland)", // 男
    "Microsoft Yunyang Online (Natural) - Chinese (Mainland)", // 男
    "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)", // 女
    // 
    "Microsoft Libby Online (Natural) - English (United Kingdom)",
    "Microsoft Maisie Online (Natural) - English (United Kingdom)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)", // Ryan 具备“自动语言预测功能
    "Microsoft Sonia Online (Natural) - English (United Kingdom)",
    "Microsoft Thomas Online (Natural) - English (United Kingdom)",
];

var aExclude = [
    "Microsoft Yunxia Online (Natural) - Chinese (Mainland)", // 中，男童声
    "Microsoft Xiaoyi Online (Natural) - Chinese (Mainland)", // 中，女童声
    "Microsoft Ana Online (Natural) - English (United States)", // 英，女童声
];


