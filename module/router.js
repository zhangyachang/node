/**
 * 这里主要是为了研究 MVC 路径的一些配置，为了方便拓展，把方法写到了这里。
 * 
 * 
 */

exports.setting = function(req, res){
    console.log('执行到了setting方法');

    res.end('执行到了setting方法');
};

exports.aaaa = function(req, res){
    console.log('aaaaaa');
    res.end('aaaaa');
}
exports.postaaaa = function(req, res){
    console.log('post aaaa');
    res.end('post  aaaaaa');
}

exports.getToken = function(req, res){
    console.log('请求到了token接口');
    res.end('get  ---  token');
}

exports.goudan = function(req, res){
    console.log('请求到了狗蛋接口');

    console.log(req.query);

    res.end('狗蛋接口');
    
}

exports.params = function(req, res){
    console.log('测试 params 接口');
    console.log(`query`);
    console.log(req.query);
    console.log('params');
    console.log(req.params);

    res.end('params');

}


