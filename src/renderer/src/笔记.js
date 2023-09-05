/*
 * @Author: 李星阳
 * @Date: 2023-06-25 21:05:16
 * @LastEditors: 李星阳
 * @LastEditTime: 2023-09-02 22:56:44
 * @Description: 
 */

// ▼用浏览器朗读
var text = "别被厚度吓到，它是我见过的最适合当一本书读的词典，每天翻10页，不需要太花经历背诵、复习这些，就把例句看完即可，每天10页，慢慢翻完即可。";
var packages = window.speechSynthesis.getVoices().filter(cur=>{
    var {name, lang} = cur;
    var arr = [
        lang.startsWith('zh-') || lang.startsWith('en-'),
        name.match(/Natural|Google/i),
    ];
    if (0){
        text = '许多人认为当他们富有，取得成功时，幸福自然就会随之而来。我告诉你:事实并非如此。世界上有很多富人，但是他们却很痛苦，犹如生活在地狱中。我们都读过影星自杀或死于吸毒的故事。显而易见，钱不是解决所有问题的答案。通过不正当手段获得的财富并不能带来幸福。抽到奖券也不会带来幸福;赌博也不会带给你幸福。';
        arr.push(...[
            !name.match(/Cantonese|Hong Kong|Northeastern|Shaanxi/i),
        ]);
    }else{
        text = 'Many people think that when they become rich and successful,happiness will naturally follow.Let me tell you that nothing is further from the truth.The world is full of very rich people who are as miserable as if they were living in hell.We have read stories about movie stars who committed suicide or died from drugs.Quite clearly, money is not the only answer to all problems.';
        arr.push(...[
            name.match(/United /i),
        ]);
    }
    return arr.every(Boolean);
});
console.log(packages);
var oMsg = new SpeechSynthesisUtterance('大家好，哈哈！这是我第一次过来');

Object.assign(oMsg, {
    voice: packages[0],
    lang: 'zh-CN', // lang 
    volume: 100,
    rate: 0.9, // 速度
    pitch: 1, // 值越大越尖锐,越低越低沉
    text,
});
window.speechSynthesis.speak(oMsg); 
// window.speechSynthesis.pause();

