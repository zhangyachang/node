const url = require('url');
const logic = require('../module/router');

const strict = false;

// 加入正则匹配部分
const pathRegexp = function(path) { 
    var keys = []; 
    path = path 
    .concat(strict ? '' : '/?') 
    .replace(/\/\(/g, '(?:/') 
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
    optional, star){ 
    // 将匹配到的键值保存起来
    keys.push(key); 
    slash = slash || ''; 
    return '' 
    + (optional ? '' : slash) 
    + '(?:' 
    + (optional ? slash : '') 
    + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' 
    + (optional || '') 
    + (star ? '(/*)?' : ''); 
    }) 
    .replace(/([\/.])/g, '\\$1') 
    .replace(/\*/g, '(.*)'); 
    return { 
    keys: keys, 
    regexp: new RegExp('^' + path + '$') 
    }; 
  } 



/**
 * 定义路由函数，所有的路由函数都这样生成
 * 
 */
class Routes {
    constructor(){
        this.init(); // 初始化方法数组
    }
    init(){
        console.log('初始化方法数组');
        this.use = [];
        this.get = []; 
        this.post = [];
        this.put = [];
        this.delete = [];
        ['use', 'get', 'put', 'post', 'delete'].forEach(method => {
            this[method] = function(path, action){
                this[method + 'Routes'].push([pathRegexp(path), action]);
            };
        });
    }
}

const routes = new Routes();

console.log(routes);
console.log('这里打印的东西')

/**
 * Restful API 设计
 * 这样的路由就能识别请求方法，将业务进行分发为了让分发部分更简洁，我们先将匹配的部分抽取为 mathch 方法
 * 
 */


const match = function(pathname, routes){
    for (var i = 0; i < routes.length; i++) { 
        var route = routes[i]; 
        // 正则匹配
        var reg = route[0].regexp; 
        var keys = route[0].keys; 
        var matched = reg.exec(pathname); 
        if (matched) { 
        // 抽取具体值
            var params = {}; 
            for (var i = 0, l = keys.length; i < l; i++) { 
                var value = matched[i + 1]; 
                if (value) { 
                    params[keys[i]] = value; 
                } 
            } 
            req.params = params; 
            var action = route[1]; 
            action(req, res); 
            return true; 
        }
    }
    return false; 
}


routes.use('/name', logic.setting);
routes.use('/age', logic.setting);
routes.get('/aaaaa', logic.aaaa);
routes.post('/aaaaa', logic.postaaaa);
routes.use('/token', logic.getToken);
routes.use('/goudan/age', logic.goudan);
routes.use('/params/:ppp', logic.params);


const fn = function(req, res){
    const {pathname, query} = url.parse(req.url, true);
    console.log(`pathname = ${pathname}`);
    req.query = query;
    // 将请求方法变为小写
    const method = req.method.toLowerCase();
    if(routes.hasOwnProperty(method)){
        // 根据请求方法进行转发
        if(match(pathname, routes[method])){
            return ;
        }else{
            // 如果路径没有处理成功，尝试让 all() 来处理
            if(match(pathname, routes.all)){
                return ;
            }
        }
    }else{
        // 直接让 all() 来处理
        if(match(pathname, routes.all)){
            return ;
        }
    }
    res.end('404');
    /* 这一部分实现了 params 的匹配
    for(var i=0;i<rou.length;i++){
        var route = rou[i];
        // 这一部分是正常的匹配 解析除了 req.params
        // 正则匹配
        var reg = route[0].regexp;
        console.log('打印reg');
        console.log(reg);

        var keys = route[0].keys; 
        var matched = reg.exec(pathname); 
        if (matched) {
        // 抽取具体值
            var params = {}; 
            for (var i = 0, l = keys.length; i < l; i++) { 
                var value = matched[i + 1]; 
                if (value) { 
                    params[keys[i]] = value; 
                } 
            } 
            req.params = params; 
            var action = route[1]; 
            action(req, res);
            return ;
        } 
        */

        /* 这一部分是正则匹配
        if(route[0].exec(pathname)){
            var action = route[1];
            action(req, res);
            return ;
        }
        */

        /* 这一部分是简单的手工匹配
        if(pathname == route[0]){
            var action = route[1];
            action(req, res);
            return ;
        }
        */
    
    // handle404(req, res);

}
module.exports = fn;