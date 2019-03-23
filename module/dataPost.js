const url = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const utils = require('../utils/utils');
const config = require('../config/config');
const axios = require('axios');


/**
 * 这里主要写的一些方法是数据上传的一些解析
 * header.js 中的内容都集中在 HTTP 请求报头文中，适用于 GET 请求和大多数的其他请求。
 * 头部报文中的内容已经能够让服务器端进行大多数业务逻辑操作了，但是单纯的头部报文无法携带大量的数据。
 * 在业务中，我们往往需要接收一些数据，比如表单提交、文件提交、JSON上传、XML上传等。
 * 
 * Node 的 http 模块只对 HTTP 报文的头部进行了解析，然后触发 request 事件。
 * 如果请求中还带有内容部分 (如 POST 请求，它具有报头和内容)，内容部分需要用户自行接收和解析。
 * 通过报头的 Transfer-Encoding 或 Content-Length 即可判断请求中是否带有内容。 (写到了 utils 里面)
 * 
 * 
 */

exports.uploadBody = (req, res) => {
    const isBody = utils.hasBody(req);
    console.log(isBody);
    if(isBody){
        console.log('-----------是post请求或者带有请求信息-----------------------');
        console.log('query的值');
        console.log(req.query);

        var buffers = [];
        req.on('data', (chunk) => {
            buffers.push(chunk);
        });
        
        req.on('end', () => {
            //  Buffer.concat()内部做了一些封装，非常好的方法
            req.rawBody = Buffer.concat(buffers).toString();
            console.log('查看buffer数据和转换为字符串后的值');
            console.log(buffers);
            console.log(req.rawBody);
            console.log('调用解析函数,解析body');
            utils.postData(req, res);
            console.log(req.body);
            console.log(JSON.stringify(req.body));

            res.end('Hello world');
        });   
    }else{
        res.end('没有请求体的数据');
    }
};



/**
 * 附件上传的报文头
 * 
 * 
 */

exports.fileData = function(req, res){
    const isBody = utils.hasBody(req);
    console.log(isBody);
    console.log('提交到了附件上传接口');
    if(isBody){
        console.log('-----------是post请求或者带有请求信息-----------------------');
        console.log('query的值');
        console.log(req.query);

        var buffers = [];
        req.on('data', (chunk) => {
            buffers.push(chunk);
        });
        
        req.on('end', () => {
            //  Buffer.concat()内部做了一些封装，非常好的方法
            req.rawBody = Buffer.concat(buffers).toString();
            console.log('查看buffer数据和转换为字符串后的值');
            console.log(buffers);
            console.log(req.rawBody);
            utils.postData(req, res);
            console.log(req.body);
            res.end('Hello world');
        });   
    }else{
        res.end('没有请求体的数据');
    }
    
}




