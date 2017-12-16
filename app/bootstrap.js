//  author:zhoulujun  createDate:2016-06-25   
//  项目驱动文件

require.config({
    paths: {
        '$': 'jquery',
        'fastclick': 'fastclick',
        'CryptoJS': 'crypto-js',
        //基础组件库引入
        'angular': 'angular.min',
        'angular-ui-router': 'angular-ui-router.min',
        'angular-async-loader': 'angular-async-loader.min',
        'app': './app',
        'directiveFreq': './directive/directiveFreq',
        'factoryFreq': './factory/frequently',
        'run': './run',
        'filter': './filter/comFilter',
        'cityJ':'./common/cityJson',
        'cityP':'./common/cityPopt',
        'cityS':'./common/citySet'
    },
    shim: {
        '$': {exports: '$'},
        'CryptoJS': {exports: 'CryptoJS'},
        //基础组件库声明
        'angular': {exports: 'angular'},
        'angular-ui-router': {deps: ['angular']},
        'app': {exports: 'app', deps: ['angular']},
        'cityJ':{exports:'cityJ'},
        'cityP':{exports:'cityP',deps:['$']},
        'cityS':{exports:'cityS',deps:['$']}
    },
    deps: ['bootstrap']
    //urlArgs: "bust=" + (new Date()).getTime()  //防止读取缓存，调试用
});
window.noTitle=false;
var ua = window.navigator.userAgent.toLowerCase();
if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    window.noTitle=true;
}
require(['angular', './routes', 'fastclick'], function (angular, routes, fastclick) {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
        new fastclick(document.body);

    });
    
    
});

