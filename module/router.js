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