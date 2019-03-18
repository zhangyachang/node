const http = require('http');

/**
 *  对于一个Web应用而言，仅仅只是上面这样的响应远远达不到业务的需求。再具体的业务中，有可能会有如下这些需求
 *  请求方法的判断
 *  URL的路径解析
 *  URL中查询字符串解析
 *  Cookie的解析
 *  Basic认证
 *  表达数据的解析
 *  任意格式文件的上传处理
 *  除此之外，可能还有session(会话)的需求
 * 
 */
const server = http.createServer((req, res) => {

    res.writeHead(200, {"Content-Type": "text/html; charset=utf8"});
    var str = `<h1>字符串</h1>`
    // res.end('Hello world\n');
    res.write(str);
    
    setTimeout(() => {
        res.write('aaaaa\n');
    },100);
    setTimeout(() => {
        res.write('bbb\n');
    },2000);
    setTimeout(() => {
        res.write('ccc\n');
    },3000);
    setTimeout(() => {
        res.write('dddd\n');
        res.end();
    },4000);

    

});


server.listen(3000, () => {
    console.log('3000端口服务启动成功');
});


