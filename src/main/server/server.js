const os = require('os');
const http = require('http');
var querystring = require("querystring");
let server;

// 开启局域网接口
function openServer() {
    // 防止重复开启
    closeServer();
    // 获取本机的局域网IP和自定义端口
    let SERVER_PORT = 8899;
    // let SERVER_IP = getServerIp();
    // let SERVER_IP = '127.0.0.1';
    let SERVER_IP = 'localhost';
    console.log('🎶🎶🎶SERVER_IP');
    console.log(SERVER_IP);
    toLog(SERVER_IP);
    server = http.createServer(function (request, response) {
        // 回调函数接收request和response对象,
        // 获得HTTP请求的method和url:
        console.log(request.method + ': ' + request.url);
        // 将HTTP响应200写入response, 同时设置Content-Type: text/html:
        response.writeHead(200, {"Content-Type": "application/json;charset=utf-8", "access-control-allow-origin": "*",});
        // 将HTTP响应的HTML内容写入response:
        response.end('Hello world!' + new Date()*1);
    });
    // server.on('request', (req, res) => {
    //     toLog("server.on('request'");
    //     // 防止跨域
    //     res.writeHead(200, {
    //         "Content-Type": "application/json;charset=utf-8",
    //         "access-control-allow-origin": "*",
    //     });
    //     let param = null; // 监听传递的值
    //     req.on("data", function (postDataChunk) {
    //         param = querystring.parse(postDataChunk.toString());
    //         console.log(param);
    //         res.end(JSON.stringify({abc: 123 }));
    //     });
    //     // 监听 接口
    //     req.on('end',()=>{
    //         if (0){
    //             return res.end(JSON.stringify({msg: 'wrong'}));
    //         }
    //         // if (1 || req.method === 'POST' && req.url === '/') { }
    //         let context = {
    //             code: 200,
    //             param,
    //             data: { 
    //                 type: `Hello World! ${new Date()*1}`,
    //                 url: req.url,
    //             },
    //         };
    //         toLog(JSON.stringify(context));
    //         res.end(JSON.stringify(context));
    //     })
    // })
    // 返回端口开启结果
    return new Promise((resolve, reject) => {
        server.listen(8899);
        // server.listen(SERVER_PORT, SERVER_IP, () => {
        //     // 服务器正确开启
        //     resolve({
        //         code: 200,
        //         data: `http://${SERVER_IP}:${SERVER_PORT}`,
        //         msg: `服务器开启成功，服务器地址: http://${SERVER_IP}:${SERVER_PORT}`
        //     })
        // });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // 服务器端口已经被使用
                reject({
                    code: 404,
                    data: `端口:${SERVER_PORT}被占用,请更换占用端口`,
                    msg: `端口:${SERVER_PORT}被占用,请更换占用端口`
                })
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

// 获取本机的局域网IP
function getServerIp() {
    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

export {
    openServer,
    closeServer
}

/* 
作者：雾恋
链接：https://juejin.cn/post/7220997060136796218
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。 */