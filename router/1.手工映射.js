/**
 * 这里是学习路由的部分，按照顺序看下去。
 * 
 */


/**
 * 手工映射
 * 手工映射除了需要手工配置路由较为原始外，它对 URL 的要求十分灵活，几乎没有格式上的限制。
 * 
 * 
 */
var routes = [];
var use = function(path, action){
    routers.push([path, action]);
};
// 我们在入口程序判断 URL，然后执行并调用对应的逻辑，于是就完成了基本的路由映射过程，如下所示。
const fn = function(req, res){

    var pathname = url.parse(req.url).pathname;

    for(var i=0;i<routes.length;i++){
        var route = route[i];
        if(pathname == route[0]){
            var action = route[1];
            action(req, res);
            return ;
        }
    }
    handle404(req, res);
}

/**
 * 手工映射十分方便，由于它对 URL 十分灵活，所以我们可以将两个路径都映射到相同的业务逻辑，如下所示
 * 
 * use('/user/setting', exports.setting);
 * use('/setting/user', exports.setting); 
 * 甚至
 * use('/setting/user/jacksontian', exports.setting); 
 * 
 */