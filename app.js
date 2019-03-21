const http = require('http');
const url = require('url');
const utils = require('./utils/utils');
const header = require('./module/header');
const dataPost = require('./module/dataPost');



const server = http.createServer((req, res) => {
    // 解析ip地址
    // const ip = utils.getClientIp(req);
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');  // 解决 Cors 跨域

    const headerArr = {
        '/method': header.reqMethod, // 解析请求方法
        '/public': header.publicFile,    // 静态资源服务器
        '/distribution': header.distribution, // 分发资源
        '/parseUrl': header.parseUrl, // 解析Url
        '/parseCookie': header.cookie, // 解析cookie
        '/setCookie': header.setCookie, // 设置Cookie
        '/addSession': header.addSession, // 请求cookie到来了, 此方法暂未实现
        '/basic': header.basic,  // basic 认证，还未完成
        
    };

    const postArr = {
        '/uploadBody': dataPost.uploadBody, // 处理请求体中的内容
    }

    const {pathname, query} = url.parse(req.url, true);
    console.log('查看请求信息');
    console.log(pathname, query);
    req.query = query;

    if (headerArr[pathname]) {
        headerArr[pathname](req, res);
    }else if(postArr[pathname]){
        console.log("是请求到post里面来了吧");
        postArr[pathname](req, res);
    }else{
        console.log('还是请求到这里来了吗');
        
        let msg = JSON.stringify({
            status: '错误了',
            msg: 'error'
        });
        res.end(msg);
    }

    // res.end('Hello world');

});


server.listen(3000, () => {
    console.log('3000端口服务启动成功');
});
