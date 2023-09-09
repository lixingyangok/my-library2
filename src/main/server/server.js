import {get_text, send_text} from './read-aloud.js';
const http = require('http');
let server;
const oApiFn = {
    '/get_text': get_text,
    '/send_text': send_text,
};

// 开启局域网接口
function openServer() {
    closeServer(); // 防止重复开启
    const SERVER_IP = 'localhost'; // 127.0.0.1
    const SERVER_PORT = 8899;
    const sRootURL = `http://${SERVER_IP}:${SERVER_PORT}`;
    server = http.createServer((request, res) => {
        const oRequestUrl = urlToPlainObject(new URL(request.url, sRootURL));
        const {pathname} = oRequestUrl;
        const {method} = request;
        const fnDoer = oApiFn[pathname] || (() => ({}));
        res.writeHead(200, {
            "Content-Type": "application/json;charset=utf-8",
            "access-control-allow-origin": "*", // 防止跨域
        });
        let aBody = [];
        request.on("data", function (postDataChunk) {
            aBody.push(postDataChunk);
        });
        // 监听 接口
        request.on('end',()=>{
            // let oResult = {}; // '接口被叫时间': new Date().toString()
            const oBody = getBody(aBody);
            let oResult = {
                code: 200,
                submit: {
                    body: oBody,
                    oRequestUrl: urlToPlainObject(oRequestUrl),
                    url: request.url,
                    method,
                },
                data: {
                    ...fnDoer(oBody),
                },
            };
            res.end(JSON.stringify(oResult));
        });
    });
    // server.on('request', );
    // 返回端口开启结果
    return new Promise((resolve, reject) => {
        // 参数123 = 端口，地址，回调函数
        server.listen(SERVER_PORT, SERVER_IP, () => {
            const status = {
                code: 200,
                data: sRootURL,
                msg: `服务器开启成功，地址: ${sRootURL}`,
            };
            console.log(status.msg);
            resolve(status);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 服务器端口已经被使用
                reject({
                    code: 404,
                    data: `端口:${SERVER_PORT}被占用,请更换占用端口`,
                    msg: `端口:${SERVER_PORT}被占用,请更换占用端口`,
                });
            }
        });
    });
}

// 关闭server
function closeServer() {
    server && server.removeAllListeners();
    server && server.close(() => {
        console.log("服务接口关闭");
    });
}

export {
    openServer,
    closeServer
};

function getBody(bodyData){
    if (!bodyData.length) return {};
    const sBody = Buffer.concat(bodyData).toString();
    const oBody = JSON.parse(sBody);
    return oBody;
}


function urlToPlainObject(url) {
    const plainObject = {
        oParams:{},
    };
    for (const key in url) {
        if (typeof url[key] === 'string') {
            plainObject[key] = url[key];
        }
    }
    if (url.search){
        const search = decodeURI(url.search).slice(1);
        const sParams = `{"${search.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`;
        plainObject.oParams = JSON.parse(sParams);
    }
    return plainObject;
}


function copy_it(obj){
    const oInfo = Object.entries(obj).reduce((oResult, oCur)=>{
        const [key,val] = oCur;
        try{
            let newObj = {...oResult, [key]: val};
            newObj = JSON.parse(JSON.stringify(newObj));
            return newObj;
        }catch(err){
            oResult[key] = `___${typeof val}`;
            return oResult;
        }
    }, {copied: true});
    return oInfo;
}

// server = http.createServer(function (request, response) {
//     // 回调函数接收request和response对象,
//     // 获得HTTP请求的method和url:
//     console.log(request.method + ': ' + request.url);
//     // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
//     // response.writeHead(200, {"Content-Type": "application/json;charset=utf-8", "access-control-allow-origin": "*",});
//     response.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
//     // 将HTTP响应的HTML内容写入response:
//     const oInfo = Object.entries(request).reduce((oResult, oCur)=>{
//         const [key,val] = oCur;
//         try{
//             let newObj = {...oResult, [key]: val};
//             newObj = JSON.parse(JSON.stringify(newObj));
//             return newObj;
//         }catch(err){
//             oResult[key] = `___${typeof val}`;
//             return oResult;
//         }
//     }, {test: 123});
    
//     response.end(JSON.stringify({
//         timeVal: new Date()*1,
//         ...oInfo,
//     }));
// });