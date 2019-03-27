const axios = require('axios');
const url = require('url');
const querystring = require('querystring');

const config = require('../config/config');


/**
 * 第三方网站授权
 * 
 */



 /**
  * github登录
  * 
  */
exports.githubLogin = async ctx => {
    const timestamp = Date.now();
    const github = config.github;
    const redirectUrl = `${github.url}/?client_id=${github.clientId}&scope=${github.scope}&state=${timestamp}`;
    ctx.redirect(redirectUrl);

};


/**
 * github 的第三方登录功能
 * 回调函数返回的地址吗？
 * 
 */

exports.githubCallback = async ctx => {
    const {code, state} = ctx.query;
    console.log('打印code 和 state');
    console.log(code, state);
    const github = config.github;

    const result = await new Promise((resolve, reject) => {
        axios({
            url: 'https://github.com/login/oauth/access_token',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: {
                client_id: github.clientId,
                client_secret: github.clientSecret,
                code: code
            }
        })
            .then(res => {
                resolve({
                    status: 200,
                    msg: res.data
                });
            })
            .catch(err => {
                reject({
                    status: 400,
                    msg: err
                })
            })
    });
    if(result.status == 400){
        ctx.body = '服务器错误';
        return ;
    }


    const {access_token, scope, token_type} = querystring.parse(result.msg);
    console.log(access_token, scope, token_type);
    if(!access_token){
        ctx.body = '请求错误,请重新认证';
        return ;
    }

    // 请求用户信息
    const userInfo = await new Promise((resolve, reject) => {
        axios({
            url: `https://api.github.com/user?access_token=${access_token}`,
        })
            .then(res => {
                resolve({
                    status: 200,
                    msg: res.data
                })
            })
            .catch(err => {
                reject({
                    status: 400,
                    msg: err
                })
            })
    })
    console.log('请求到的用户信息如下');
    if(userInfo.status == 400){
        ctx.body = '请求用户信息出错';
    }

    console.log('请求用户信息成功');
    console.log(userInfo);


    ctx.body = userInfo;
}
