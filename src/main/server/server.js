import {get_text, send_text} from './read-aloud.js';
const os = require('os');
const http = require('http');
var querystring = require("querystring");
let server;
const oApiFn = {
    '/get_text': get_text,
    '/send_text': send_text,
};

// 开启局域网接口
function openServer() {
    closeServer(); // 防止重复开启
    let SERVER_IP = 'localhost'; // 127.0.0.1
    let SERVER_PORT = 8899;
    const sRootURL = `http://${SERVER_IP}:${SERVER_PORT}`;
    server = http.createServer();
    server.on('request', (req, res) => {
        const {method, url} = req;
        const oRequestUrl = urlToPlainObject(new URL(url, sRootURL));
        let iAskMark = url.indexOf('?');
        let iEnd = iAskMark > -1 ? iAskMark : url.length;
        const sUrl = url.slice(0, iEnd);
        const fnDoer = oApiFn[sUrl] || (()=>({}));
        res.writeHead(200, {
            "Content-Type": "application/json;charset=utf-8",
            "access-control-allow-origin": "*", // 防止跨域
        });
        let body = [];
        let oResult = {'接口被叫时间': new Date().toString() };
        req.on("data", function (postDataChunk) {
            body.push(postDataChunk);
        });
        // 监听 接口
        req.on('end',()=>{
            if (body.length){
                body = Buffer.concat(body).toString();
                body = JSON.parse(body);
            }
            Object.assign(oResult, {
                code: 200,
                submit: {
                    body,
                    oRequestUrl: urlToPlainObject(oRequestUrl),
                    url,
                    method,
                    sUrl,
                },
                data: {
                    ...fnDoer(body),
                },
            });
            // toLog(JSON.stringify(context));
            res.end(JSON.stringify(oResult));
        });
    });
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