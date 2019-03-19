const config = require('../config/config');

exports.judgeReqMethods = function(){

}


/**
 *  获取访问者的ip地址
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



