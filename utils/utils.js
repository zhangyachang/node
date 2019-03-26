const config = require('../config/config');
const querystring = require('querystring');
const xml2js = require('xml2js');


exports.judgeReqMethods = function(){

}


/**
 * 获取访问者的ip地址
 * 这里的方法好像是不可行的，但是有一篇文章看起来可信度比较高，可以查看原文地址，可以获取真正的ip地址，
 * 请求头中携带的 ip 都不可信，Remote Address 是实际的
 * https://imququ.com/post/x-forwarded-for-header-in-http.html
 * 
 *  @params {Object} req 请求对象
 *  @return {String} ip
 */
exports.getClientIp = function(req){
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
        ip = ip.split(',')[0]
    }
    return ip;
}

exports.getTruthClientIp = function(req){
    return req.connection.remoteAddress;
}

/**
 * 解析 post 请求的数据，根据不同的类型去分别的解析
 * 把解析到的东西通过 json 格式挂载到 req.body 中
 * 
 * @params req
 * @params res
 * 
 * 最为常见的数据提交就是通过网页表单提交数据到服务器端 
 * 默认的表单提交，请求头中的 Content-Type 字段值为 application/x-www-form-urlencoded
 * 除了表单之外，常见的提交还有 JSON 和 XML 文件等。
 * 判断和解析他们的原理都比较相似，都是依据 Content-Type中的值决定的。
 * JSON 类型的值为 application/json
 * XML 的值为 application/xml。
 * 需要注意的是，在Content-Type中还可能附带如下所示的编码信息
 * Content-Type: application/json; charset=utf-8
 * 所以在判断时，需要注意区分，如下所示
    var mime = function (req) { 
        var str = req.headers['content-type'] || ''; 
        return str.split(';')[0]; 
    };
 * 
 * 可以看到下面的方法，无论客户端提交的是什么格式，我们都可以通过这种方式来判断数据是何种类型，然后采用对应的解析方法即可。
 * 
 */
exports.postData = function(req, res){
    const TYPE = {

        'application/x-www-form-urlencoded'(){
            req.body = querystring.parse(req.rawBody);
        },

        'application/json'(){
            try{
                // 如果从客户端提交 JSON 内容，对于 Node 来说，要处理它都不需要额外的任何库
                req.body = JSON.parse(req.rawBody);
            }catch(e){
                // 异常内容, 响应 Bad Request
                res.writeHead(400);
                res.end('Invlid JSON');
                return ;
            }
        },

        'application/xml'(){
            // 解析 XML 文件稍微复杂一点，但是社区有支持 XML 文件到 JSON 文件转换的库，比如有  xml2js
            xml2js.parseString(req.rawBody, function(err, xml){
                if(err){
                    res.writeHead(400);
                    res.end('Invalid XML');
                    return ;
                }
                req.body = xml;
            });
        }
        
    }

    function contentType(req){
        const str = req.headers['content-type'] || '';
        return str.split(';')[0];
    }

    const postType = contentType(req);
    console.log('请求数据类型' + postType);
    
    if( postType === 'application/x-www-form-urlencoded'){
        console.log('application/x-www-form-urlencoded');
        TYPE[postType]();
    }else if(postType === 'application/json'){
        console.log('application/json');
        TYPE[postType]();
    }else if(postType === 'application/xml'){
        console.log('application/xml');
        TYPE[postType]();
    }else{
        console.log('没有匹配到吧');
        req.body = {};
    }
}


/**
 * 除了常见的表单和特殊格式的内容提交外，还有一种比较独特的表单。
 * 通常的表单，其内容可以通过 urlencode 的方式编码内容形成报文体，再发送给服务器，但是业务场景往往需要用户直接提交文件。
 * 在前端 HTML 代码中，特殊表单与普通表单的差异在于该表单中可以含有 file类型的控件，以及需要
 * 指定表单属性 enctype 为 multipart/form-data 
    <form action="/upload" method="post" enctype="multipart/form-data"> 
        <label for="username">Username:</label> <input type="text" name="username" id="username" /> 
        <label for="file">Filename:</label> <input type="file" name="file" id="file" /> 
        <br /> 
        <input type="submit" name="submit" value="Submit" /> 
    </form> 
 * 
 * 浏览器在遇到 multipart/form-data 表单提交时，构造的请求报文与普通表单完全不同。
 * 首先它的报头中最为特殊的如下所示。
 * 
 * Content-Type: multipart/form-data; boundary=AaB03x 
 * Content-Length: 18231 
 * 
 * 它代表本次提交的内容是由多部分构成的，其中 boundary=AaBo3x 指定的是每部分内容的分界符， AaBo3x 是随机生成的一段字符串，
 * 
 * 报文体中的内容将通过在它前面添加 -- 进行分割，报文结束时在它前后都加上 -- 表示结束。
 * （下面有一串我自己上传的乱码的部分，可以看，我删除了一部分乱码）
 * 
 * 另外，Content-Length的值必须确保是报文体的长度。
 * 一旦我们知晓报文是如何构成的，那么解析它就变得十分容易。值得注意的一点是，由于是文件上传，那么像普通表单、JSON 或 XML 
 * 那样先接收内容再解析的方式将变得不可接受。接收大小未知的数据量时，我们需要十分谨慎。
 * 
 * 
 * 
 * 
 * 
 */

/*

------WebKitFormBoundaryBALjHlmN6Da2FPrA
Content-Disposition: form-data; name="user"

aa
------WebKitFormBoundaryBALjHlmN6Da2FPrA
Content-Disposition: form-data; name="password"

aaa
------WebKitFormBoundaryBALjHlmN6Da2FPrA
Content-Disposition: form-data; name="file"; filename="logopng1.png"
Content-Type: image/png

�PNG

IHDR   �  5/nnK߽1`/��Ij>�╗!║6W@P ╝║BP ╝║BA�A�╝║BP ╝║BP ╝A���� �*=��~r�    IEND�B`�
------WebKitFormBoundaryBALjHlmN6Da2FPrA--

*/

/*
    第二段 没有文件控件的
------WebKitFormBoundaryeue4mMTk90SXEuJb
Content-Disposition: form-data; name="user"

123
------WebKitFormBoundaryeue4mMTk90SXEuJb
Content-Disposition: form-data; name="password"

aaa
------WebKitFormBoundaryeue4mMTk90SXEuJb--
*/





/**
 * 判断请求体中有没有内容
 * @params {Object} req
 * 
 */
exports.hasBody = function(req){
    // 这里的 content-length 我知道  transfer-encoding 是什么
    // https://www.jianshu.com/p/ab38eb9ba8cb 可以去这篇文章中看一下
    return 'transfer-encoding' in req.headers || 'content-length' in req.headers
}


/**
 * 解析cookie
 * 
 * @params {String} cookie 
 * @return {Object}
 * 
 */
exports.parseCookie = function(cookie){
    var cookies = {};
    if(!cookie){
        return cookies;
    }
    var list = cookie.split(';');
    for(var i=0;i<list.length;i++){
        var pair = list[i].split('=');
        cookies[pair[0].trim()] = pair[1];
    }
    return cookies;
}


/**
 * 序列化 Cookie
 * 
 * @params {String} key
 * @params {String} value
 * @params {Object} opt 选项
 * 
 * @return {String} 'Set-Cookie: name=value; Path=/; Expires=Sun, 23-Apr-23 09:01:35 GMT; Domain=.domain.com;'
 * 
 */
exports.serialize = function(name, value, opt = {}){
    var pair = [name + '=' + encodeURI(value)]; /* 这里的压缩码应该没有问题的吧 */
    if(opt.maxAge) pair.push('Max-Age' + opt.maxAge);
    if(opt.domain) pair.push('Domain' + opt.domain);
    if (opt.path) pairs.push('Path=' + opt.path);
    if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
    if (opt.httpOnly) pairs.push('HttpOnly');
    if (opt.secure) pairs.push('Secure');
    return pair.join('; ');
}


/**
 * 生成唯一的不重复的 session
 * @return {String} session
 * 
 */

exports.generateSession = function(){
    var generate = function(){
        var session = {};
        session.id = (new Date()).getTime() + Math.random();
        session.cookie = {
            expire: (new Date()).getTime() + config.EXPIRES
        };
        config.sessions[session.id] = session;
        return session;
    }
}




/**
 * Base64编码、解码
 * 
 * @return {Object}
 *  obj.decode
 *  obj.encode
 * 
 */
exports.NodeBase = function(){
    return {
        encode: function(str){
            return new Buffer(str).toString('base64');
        },
        decode: function(str){
            return new Buffer(str, 'base64').toString();
        }
    }
}



/**
 * Base64编码、解码
 * 这一段代码纯粹是Js中是这样实现的,我们把下面这段代码放弃，并决定使用 Node 中对 base64位的编码解码
 * 其实前端中对于谷歌浏览器来说也有 window.atob()  window.btoa() 进行解码和编码
 * 
 * @return {Object} base64
 *  obj.encode(str, 'base64')
 *  obj.decode(str, 'base64')
 * 
 */
exports.BASE64 = function(str){

    var base64 = (function(){
        var base64Chars = [
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
                'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
                'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
                'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
                'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
                'w', 'x', 'y', 'z', '0', '1', '2', '3',
                '4', '5', '6', '7', '8', '9', '+', '/'
            ],
            encode = {
                'base64':codeBase64
            },
            decode = {
                'base64':decodeBase64
            }
        handleFormat = {
            'utf-8':toUTF8Binary
        };
        function stringToBinary(str , size , encodeType ){
            //  str-字符串 , size - 转换后的二进制位数 ,encodeType - 采用什么格式去保存二进制编码
            var i,
                len,
                binary = '';
            for ( i = 0 , len = str.length ; i < len ; i++ ){
                binary = binary + handleFormat[encodeType.toLowerCase()](str.charCodeAt(i));
            }
            // console.log(binary);  这里打印的内容是翻译过后的二进制
            return binary;
        }
        // 转换为以UTF-8格式的二进制数据
        function toUTF8Binary(unicode){
            var len,
                binary = '',
                star = 0,
                bitStream = unicode.toString(2), // 转换为二进制比特流
                bitLen = bitStream.length,
                i;
            if( unicode >= 0x000000 && unicode <= 0x00007F ){
                binary = bitStream;
                for( i = 0 , len = 8 ; i　< len-bitLen ; i ++ ){
                    binary = 0 +binary; // 不足8位补0
                }
            }else if( unicode >=0x000080 && unicode <=0x0007FF ){
                binary = bitStream;
                for( i = 0 , len = 11 ; i　< len-bitLen ; i ++ ){
                    binary = 0 +binary; // 不足11位补0
                }
                binary = '110'+binary.substr(0,5) + '10' + binary.substr(5,6);
            }
            else if( unicode >=0x000800 && unicode <=0x00FFFF ){
                binary = bitStream;
                for( i = 0 , len = 16 ; i　< len-bitLen ; i ++ ){
                    binary = 0 +binary; // 不足16位补0
                };
                binary = '1110' + 
                         binary.substr(0,4) + 
                         '10' + 
                         binary.substr(4,6) + 
                         '10' + 
                         binary.substr(10,6);
            }
            else if( unicode >=0x010000 && unicode <=0x10FFFF ){
                binary = bitStream;
                for( i = 0 , len = 21 ; i　< len-bitLen ; i ++ ){
                    binary = 0 +binary; // 不足21位补0
                }
                binary = '11110' + 
                         binary.substr(0,3) + 
                         '10' + 
                         binary.substr(3,6) + 
                         '10' + 
                         binary.substr(9,6) +
                         '10' + 
                         binary.substr(15,6);
            }
            return binary;
        }
        // 编码成base64格式
        function base64Parse(binary24,flag){
            var i,
                len,
                result = '',
                decode;
            if(flag == 1){
                for( i = 0 ; i < 4 ; i++){
                    decode = parseInt(binary24.substr(i*6,6),2);
                    result = result + base64Chars[decode];
                }
            }
            else{
                for ( i=0 , len = Math.floor(flag/6) ;i<len+1; i++){
                    decode = parseInt(binary24.substr(i*6,6),2);
                    result = result + base64Chars[decode];
                }
                for( i = 0; i < 3-len ;i ++){
                    result = result + '=';
                }
            }
            return result;
        }
        // 解析为base64格式的二进制数据
        function codeBase64(str){
            var i,
                len,
                rem,
                mer,
                result = '',
                strBinaryAry = [],
                binary = stringToBinary(str , 8 , 'utf-8'); // base64是基于utf-8格式保存的二进制数据转换的
            len = binary.length;
            mer = Math.floor(len / 24);
            rem = len % 24;
            for( i = 0 ; i < mer ; i++){
                result = result +  base64Parse(binary.substr(i*24,24),1);
            }
            remCode = binary.substr(len-rem,rem);
            if( rem > 0 ){
                for( i =0 ; i < 24-rem ; i++){
                    remCode = remCode + 0;
                }
                result = result +  base64Parse(remCode,rem)
            }
            return result;
    
        }
        // 解码base64格式的数据
        function decodeBase64(str){
            var i,
                j,
                k,
                len,
                t = 0,
                curbinary,
                start  = 0 ,
                flag = [
                    {
                        str:'0',
                        len:8
                    },
                    {
                        str:'110',
                        len:11
                    },
                    {
                        str:'1110',
                        len:16
                    },
                    {
                        str:'11110',
                        len:21
                    }],
                binary= '',
                newStr = '';
            for( i = 0 , len = str.length ; i < len ; i++){
                var curbinary  = base64Chars.indexOf(str.charAt(i)).toString(2);
                if( curbinary != '-1'){
    
                    for( j = 0 ; curbinary.length <6 ; j++){
                        curbinary = 0 + curbinary;
                    }
                    binary = binary + curbinary;
                }
                if( i >= len-2 && str.charAt(i) == '='){
                    ++t;
                }
            }
            if( t == 0 ){
                len = binary.length;
            }
            else{
                len = binary.length - (6-2*t)
            }
    
            for( ; start < len ;){
                for( j  = 0 ; j < 4 ; j++){
    
                    if(binary.indexOf( flag[j].str ,start) == start){
                        if(flag[j].len == 8){
                            newStr = newStr +
                                     String.fromCharCode(parseInt(binary.substr(start,8),2));
                        }
                        else if(flag[j].len == 11){
                            newStr = newStr +
                                     String.fromCharCode(parsetInt(binary.substr(start+3,5) + 
                                     binary.substr(start+10,6),2));
                        }
                        else if(flag[j].len == 16){
                            newStr = newStr +     
                                     String.fromCharCode(parsetInt(binary.substr(start+4,4) + 
                                     binary.substr(start+10,6) + 
                                     binary.substr(start+18,6),2));
                        }
                        else if(flag[j].len == 21){
                            newStr = newStr + 
                                     String.fromCharCode(parseInt(binary.substr(start+5,3) + 
                                     binary.substr(start+10,6) + binary.substr(start+18,6) +
                                     binary.substr(start+26,6),2));
                        }
                        start  =  start  + flag[j].len;
                        break;
                    }
                }
            }
            binary = null;
            return newStr;
        }
        return {
            encode:function(str ,type){
                return encode[type](str);
            },
            decode:function(str, type){
                return decode[type](str);
            }
        };
    })();

    /**
     * 使用介绍 
     * base64.encode(str, 'base64')
     * base64.decode(str, 'base64')
     * 参考博客文章  https://imweb.io/topic/5b8ea5327cd95ea86319358a
     */
    return base64;
}



