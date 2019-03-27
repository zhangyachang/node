/**
 * 参数解析
 * 尽管完成了正则匹配，我们可以实现相似 URL 匹配，但是 :username 到底匹配了啥，还没有解决。
 * 为此我们需要进一步将匹配到的内容抽取出来，希望在业务中能有如下这样调用：
 * 
 * use('/profile/:username', function(req, res){
 *   var username = req.params.username;
 *   // TODO
 * })
 * 
 * 这里的目标是将抽取到的内容设置到 req.params 处。那么第一步就是将键值抽取出来，如下所示：
 * 
 */
var pathRegexp = function(path) { 
    var keys = []; 
    path = path 
    .concat(strict ? '' : '/?') 
    .replace(/\/\(/g, '(?:/') 
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture,  optional, star){ 
    // 将೅配ڟ的॰ኵԍ存ഐઠ
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
};

/**
 * 我们将根据抽取的键值和实际的 URL 得到键值匹配到的实际值，并设置到 req.params 处，如下所示
 * 
 */
const fn = function (req, res) { 
    var pathname = url.parse(req.url).pathname; 
    for (var i = 0; i < routes.length; i++) { 
      var route = routes[i]; 
      // 正则೅配
      var reg = route[0].regexp; 
      var keys = route[0].keys; 
      var matched = reg.exec(pathname); 
      if (matched) { 
      // ؏ൽ具体ኵ
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
      return; 
      } 
    } 
    // 处理404请求
    handle404(req, res); 
  };

/**
 * 至此，我们除了从查询字符串（req.query）或提交数据（req.body）中取到值之外，还能从路径的映射取到值。
 * 
 */


