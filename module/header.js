const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils/utils');
const config = require('../config/config');
const axios = require('axios');



/**
 * 对于一个Web应用而言，仅仅只是上面这样的响应远远达不到业务的需求。再具体的业务中，有可能会有如下这些需求
 * 请求方法的判断
 * URL的路径解析
 * URL中查询字符串解析
 * Cookie的解析
 * Basic认证
 * 表达数据的解析
 * 任意格式文件的上传处理
 * 除此之外，可能还有session(会话)的需求
 * 
 */




/**
 * 请求方法,在Web中，最常见的请求方法是GET和POST，除此之外还有HEAD、DELETE、PUT、CONNECT等方法。
 * 请求方法存在于报文的第一行的第一个单词，通常是大写。
 *
    > GET /path?foo=bar HTTP/1.1 
    > User-Agent: curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5 
    > Host: 127.0.0.1:1337 
    > Accept: *\/* (此处转义了)
    > 
 * 
 * HTTP_Parser在解析请求报文的时候，将报文头抽取出来，设置为req.method。通常我们只需要处理GET和POST两类请求方法，
 * 但是在RESTful类Web服务器中的请求方法十分重要，因为它会决定资源的操作行为。
 *  GET：读取（Read）
    POST：新建（Create）
    PUT：更新（Update）
    PATCH：更新（Update），通常是部分更新
    DELETE：删除（Delete）
 * 
 */
exports.reqMethod = function(req, res){
    var reqMethods = {
        'GET': 'get请求',
        'POST': 'post请求',
        'DELETE': 'delete请求',
        'PUT': 'put请求'
    };
    if(reqMethods[req.method]){
        console.log('请求路径的额解析   ' + req.url);
        let query = url.parse(req.url, true);
        // console.log(query);
        console.log('请求路径' + query.pathname);
        console.log('请求数据' + JSON.stringify(query.query));
        console.log(reqMethods[req.method]);
        res.end(JSON.stringify({
            status: 75200,
            msg: reqMethods[req.method]
        }));

    }else{
        var msg = `暂时不处理${req.method}这种请求方式`;
        console.log(msg);
        res.end(JSON.stringify({
            status: 75400,
            msg: msg
        }));
    }
}


/**
 * 最常见的根据路径进行业务处理的应用是静态文件服务器，它会根据路径去查找磁盘中的文件，
 * 然后将其响应给客户端,静态资源文件服务器
 * 
 */
 exports.publicFile = function(req, res){
    var pathname = url.parse(req.url).pathname;
    fs.readFile(path.join(__dirname, '..', 'public', pathname), (err, file) => {
        if(err){
            // console.log(err);
            res.writeHead(404);
            res.end('找不到相关文件');
            return ;
        }
        res.writeHead(200, {'Content-Type': 'text/plain; charset=utf8'});
        res.end(file);
    });
}

/**
 * 还有一种比较常见的分发场景是根据路径来选择控制器，它预设路径为控制器和行为的组合，无需配置额外信息，如下所示：
 * /controller/action/a/b/c
 * 这里的controller会对应到一个控制器，action对应到控制器的行为，剩余的值会作为参数进行一些别的判断
 */
exports.distribution = function(req, res){

    var pathname = url.parse(req.url).pathname;
    var paths = pathname.split('/');
    console.log('打印那些切割开来的数组');

    console.log(paths);

    console.log('*********');
    var controller = paths[1] || 'index';
    var action = paths[2] || 'index';
    var args = paths.slice(3);

    // if(handles[controller]){

    // }

    console.log('分发请求接口的服务器资源');
    res.end('已经分发成功了');
}

/**
 * 解析查询字符串的两种方式
 * 1. querystring
 * 2. url.parse(url, true)
 *  
 * 值得注意的是，如果查询字符串中的键出现多次，那么它的值会是一个数组，
 *  业务的判断一定要检查值是数组还是字符串，否则可能会出现TypeError异常的情况
 */
exports.parseUrl = function(req, res){
    var query = querystring.parse(url.parse(req.url).query);
    console.log('******第一种方式*****');
    console.log(query);

    console.log('******第二种方式*****');
    console.log(url.parse(req.url, true).query);
    res.end('parse url string');
}


/**
 * Cookie
 * Http是一个无状态的协议，现实中的业务却是需要一定的状态的，否则无法区分用户之间的身份了。
 * 如何标识和认证一个用户，最早的方案就是cookie了
 * 
 * HTTP_Parser会将所有的报文字段解析到req.headers上，那么cookie就是req.headers.cookie
 *  根据规范中的定义，Cookie的值的格式是key=value; key2=value2 形式的。
 *  如果我们需要Cookie，解析它也很容易,方法详见 utils.parseCookie方法
 * 
 *  在业务逻辑代码开始之前，我们将其挂载在req对象上，让业务代码可以直接访问
 * 
 */

exports.cookie = function(req, res){
    console.log('查看请求头');
    console.log(req.headers);
    req.cookies = utils.parseCookie(req.headers.cookie);
    console.log('查看cookie');
    console.log(req.cookies);
    res.end('查看cookie接口');
}

/**
 * 给客户端设置cookie是通过响应报文实现的，响应的cookie在Set-cookie字段中。
 * 它的格式与请求中的格式不大相同，规范中对它的定义如下所示
 * 
 * Set-Cookie: name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com; 
 * 其中 name=value是必须包含的部分，其余部分皆是可选参数。
 * 这些可选参数将会影响浏览器在后续将Cookie发送给服务器端的行为。以下为主要的几个选项。
 * 
 * path 表示这个Cookie影响到的路径，当前访问的路径不满足该匹配时，浏览器则不能发送这个Cookie
 * Expires 和 Max-Age 是用来告知浏览器此Cookie多久后过期。前者一般而言不存在问题，但是如果服务器
 *  端的时间和客户端的时间不能匹配，这种时间设置就会存在偏差。
 *  为此，Max-Age告知浏览器这条Cookie多久后过期，而不是一个具体的时间点
 * HttpOnly 告知浏览器不允许通过脚本document.cookie去更改这个Cookie值，事实上，设置HttpOnly之后，这个值
 *  在document.cookie中不可见。但是在HTTP请求过程中，依然会发送这个Cookie到服务器
 * Secure。 当Secure值为true时，在HTTP中是无效的，在HTTPS中才有效，表示创建的Cookie只能在HTTPS连接中
 *  被浏览器传递到服务器端进行会话验证，如果是HTTP连接则不会传递该信息，所以很难被窃听到。
 * 
 * 知道Cookie在报文头中的具体格式后，下面我们将Cookie序列化成符合规范的字符串，相关代码如下：
 * 
 */
exports.setCookie = function(req, res){
    // 序列化 Cookie
    req.cookies = utils.parseCookie(req.headers.cookie);
    console.log('查看cookies');
    console.log(req.cookies);
    // 设置一条记录
    // res.setHeader('Set-Cookie', utils.serialize('server', 'server-set-cookie'));
    
    // 设置两条记录 写到数组里面 
    res.setHeader('Set-Cookie', [utils.serialize('server', 'server-set-cookie'), utils.serialize('foo', 'value')]);

    // 注意：如果分开写的话后面的会覆盖前面的

    // res.writeHead(200);
    res.end('cookie');
}


/**
 * 生成 session 代码，一旦服务器启用了 Session，它将约定一个键值作为Session的口令，这个值可以随意约定。
 * 一旦服务器检查到用户请求Cookie中没有携带该值，它就会为之生成一个值，这个值是唯一且不重复的值，并设定超时时间。
 * 
 * 每个请求到来时，检查Cookie中的口令与服务器端的数据，如果过期，就重新生成
 * 
 * 如果session过期或者口令不对重新生成session
 * 
 * client 存储的 cookie
 *  {session_id: session id}
 * 服务器端存储的sessions
    sessions:{
        每一个session唯一的id: {
            id: new Date().getTime() + Math.random(),
            expire: (new Date()).getTime() + EXPIRES
        },
        每一个session唯一的id: {
            id：
            expire: 
        }
    } 
 
 * 
 */

exports.addSession = function(req, res){
    console.log('请求到来了');
    req.cookies = utils.parseCookie(req.headers.cookie);
    console.log('打印我们的cookie');
    var id = req.cookies[config.sessionKey];
    var session = config.sessions[id];
    if(session){
        if (session.cookie.expire > new Date().getTime()) {
            // 更新超时时间
            session.cookie.expire = new Date().getTime() + EXPIRES
        }else{
            // 超时了,删除旧的数据并重新生成
            delete session[id];
            req.session = utils.generateSession();
        }
    }else{
        // 如果session过期或口令不对，重新生成session
        console.log('如果session过期或口令不对，重新生成session');
        req.session = utils.generateSession();
    }


    res.end('加入session');
}


/**
 * 当然仅仅可以生成 session 还是不足以完成整个流程，还需要在响应客户端时设置新的值。
 * 以便下次请求时能够对应服务器的数据。这里我们 hack 响应对象的 writeHead()方法。
 * 在它的内部注入设置的Cookie的逻辑，如下所示
 * 
 */
exports.setSessionForClient = function(){
    
}


/**
 * session的安全性能
 * 
 * 
 */

/*********** 
 这里的问题还是需要去试验 去解决一下，加油！！！
这里有一个疑问，就是
    www.xiaoye121.com ----->  www.baidu.com中的API接口，会把cookie带过去吗

    操作历史路由可以随意的删除一些路由吗，然后导致浏览器的路由的历史的变化。
        http://www.cnblogs.com/accordion/p/5699372.html

********* */


 /**
  * Basic 认证
  * Basic认证是当客户端与服务器端进行请求时，允许通过用户名和密码实现一种身份认证方式。
  * 它的原理和它在在服务器端通过 Node 处理的流程
  * 
  * 如果一个页面需要Basic认证，它会检查请求报文头中的 Authirization 字段的内容，该字段的值
  * 由认证由认证方式和加密值构成
  * 
  * 
  */

exports.basic = function(req, res){
    console.log('basic认证');
    var token = 'mxadmin:987852';
    var a = utils.NodeBase().encode(token);
    console.log(a);
    var token1 = 'Basic ' + a;
    console.log(token1);
    // Basic bXhhZG1pbjo5ODc4NTI=
    console.log('请求头中的内容');
    console.log(req.headers);
    console.log(req.headers.authorization);
    console.log(req.headers.authorization == token1);

    var buf = utils.NodeBase().encode('mxadmin:987852'); //new Buffer().toString('base64');

    console.log(buf);

    var decodebuf = utils.NodeBase().decode(buf);
    console.log(decodebuf);

    res.end('basic认证');
}
