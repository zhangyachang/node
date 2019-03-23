/**
 * 正则匹配
 * 对于简单的路径，采用上述的硬匹配方式（手工映射）即可，但是对于如下的路径请求就无法完全满足需求了。
 * /profile/jacksontian
 * /profile/hover
 * 
 * 这些请求需要根据不同的用户显示不同的内容，这里只有两个用户，
 * 假如系统中存在成千上万个用户，我们就不太可能手工维护所有用户的路由请求，
 * 因此正则匹配应运而生，我们希望通过以下的方式就可以匹配到任意用户。
 * 
 * use('/profile/:username', function(req, res){
 *     // TODO
 * })
 * 
 * 于是我们改进我们的匹配方式，在通过 use 注册路由时需要将路径转换为一个正则表达式，然后通过它来进行匹配，如下所示。
 * 
 * 
 */

const pathRegexp = function(path) { 
    path = path 
    .concat(strict ? '' : '/?') 
    .replace(/\/\(/g, '(?:/') 
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
  optional, star){ 
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
    return new RegExp('^' + path + '$'); 
  };

/**
 * 上述正则表达式十分复杂，总体而言，它能实现如下的匹配。
 * 
 * /profile/:username => /profile/jacksontian, /profile/hoover
 * /user.:ext => /user.xml, /user.json
 * 
 * 我们重新改进注册部分
 * 
 */
const use = function(path, action){
    routes.push([pathRegexp(path), action]);
};

/**
 * 以及匹配部分：
 * 
 */

const fn = function(req, res){
    const pathname = url.parse(req.url).pathname;

    for(var i=0;i<routers.length;i++){
        let route = route[i];
        // 正则匹配
        if(route[0].exec(pathname)){
            var action = route[1];
            action(req, res);
            return ;
        }
    }
    handle404(req, res);
};
/**
 * 现在我们的路由功能就能实现正则匹配了，无须再为大量的用户进行手工路由映射了。
 * 
 */