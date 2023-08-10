/*
 * @Author: 李星阳
 * @Date: 2023-06-25 21:05:16
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-08-10 19:50:14
 * @Description: 
 */

// ▼用浏览器朗读
var packages = window.speechSynthesis.getVoices().filter(cur=>{
    var aa = cur.name.match(/chinese/i);
    var bb = cur.name.match(/Natural/i);
    var cc = !cur.name.match(/Cantonese|Hong Kong|Northeastern|Shaanxi/i);
    return aa && bb && cc;
});

var oMsg = new SpeechSynthesisUtterance('大家好，哈哈！这是我第一次过来');
var text = "别被厚度吓到，它是我见过的最适合当一本书读的词典，每天翻10页，不需要太花经历背诵、复习这些，就把例句看完即可，每天10页，慢慢翻完即可。";

Object.assign(oMsg, {
    voice: packages[0],
    lang: 'zh-CN', // lang 
    volume: 100,
    rate: 0.9, // 速度
    pitch: 1, // 值越大越尖锐,越低越低沉
    text,
});
speechSynthesis.speak(oMsg); 

