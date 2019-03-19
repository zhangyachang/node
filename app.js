const http = require('http');
const url = require('url');
const utils = require('./utils/utils');
const logic = require('./module/logic');



const server = http.createServer((req, res) => {
    // 解析ip地址
    // const ip = utils.getClientIp(req);
   
    
    // 解析请求方法
    // logic.reqMethod(req, res);

    // 静态资源服务器
    // logic.publicFile(req, res);

    // 分发资源
    // logic.distribution(req, res);

    // 解析字符串
    // logic.parseUrl(req, res);

    // 解析cookie
    // logic.cookie(req, res);

    // 设置Cookie
    // logic.setCookie(req, res);

    // 请求cookie到来了, 此方法暂未实现
    // logic.addSession(req, res);


    logic.basic(req, res);

});


server.listen(3000, () => {
    console.log('3000端口服务启动成功');
});
