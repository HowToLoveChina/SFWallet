
define(function (require, exports, module) {
    var angular = require('angular');
    var asyncLoader = require('angular-async-loader');

    require('angular-ui-router');

    var app = angular.module('app', ['ui.router']);

    //定义全局常量
    app.constant("TRADESCENE_RECHARGE", '010200001');//充值场景码
    app.constant("TRADESCENE_WITHDRAW", '040000001');//提现场景码
    app.constant("TRADESCENE_PAY", '030200005');//缴纳保证金、支付货款场景码

    asyncLoader.configure(app);

    module.exports = app;
});


