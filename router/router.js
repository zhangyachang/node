const url = require('url');
const logic = require('../module/router');

class Routes {
    constructor(){
        this.length = 0;
        this.routes = [];
    }
    use(path, action){
        console.log('加入了路由' + this.length++);
        this.routes.push([path, action]);
    }
}

const routes = new Routes();


routes.use('/name', logic.setting);
routes.use('/age', logic.setting);
routes.use('/aaaaa', logic.aaaa)


var a = 1;

const fn = function(req, res){
    const pathname = url.parse(req.url).pathname;

    console.log('打印一下东西');
    console.log(a);
    console.log(routes.routes);
    var rou = routes.routes;
    for(var i=0;i<rou.length;i++){
        var route = rou[i];
        if(pathname == route[0]){
            var action = route[1];
            action(req, res);
            return ;
        }
    }
    // handle404(req, res);

    res.end('404');
}


module.exports = fn;