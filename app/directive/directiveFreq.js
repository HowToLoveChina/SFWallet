/**
 * 以下是经常用的  directive ，进入程序就加载，防止后面频繁载入
 */
define(['require', 'app'], function (require,app) {
    //require('$');
    app
        .directive('headTitle', ['$rootScope', '$timeout','NirvanaUtil',function ($rootScope,$timeout,NirvanaUtil) {
            return {
                restrict: 'AE',
                scope: {
                    showBackbtn: '@',//返回按钮是否显示true false
                    backTitle: '@',//"返回"按钮名称
                    appTitle: '@',//当前页面标题
                    finishTitle: '@',//"完成"按钮名称
                    goBack: '&',//返回事件
                    finishGo: '&',//完成
                    theme: '@'
                },
                replace: true,
                template: '<header class="header tc {{theme}} {{titleHas}}" >' +
                '<span class="icon-font btn-prev" ng-click="goBack()">&#xe600;</span>' +
                '<h1>{{appTitle}}</h1>' +
                '<span class="btn-next" ng-click="finishGo()">{{finishTitle}}</span>' +
                '</header>',
                link:function (scope,ele,attrs) {
                    if(noTitle){//微信环境
                        scope.titleHas='hidden';
                        document.getElementsByTagName("section")[0].style.paddingTop = "0";
                        if (NirvanaUtil.browser().android) {
                            document.title = scope.appTitle;
                        } else {
                            var $body = $('body');
                            document.title = scope.appTitle;
                            var $iframe = $("<iframe style='display:none;' src='/favicon.ico'></iframe>");
                            $iframe.on('load',function() {
                                $timeout(function() {
                                    $iframe.off('load').remove();
                                }, 0);
                            }).appendTo($body);
                        }
                    }else{
                        if ((NirvanaUtil.browser().ios || NirvanaUtil.browser().iPhone) && $rootScope.serviceName == 'SY_MCH_OPEN_WALLET_REQ') {
                            scope.titleHas='padding-header-top';
                        }else {
                            scope.titleHas='';
                        }
                    }

                }
            }
        }])
        /* Loading 遮罩层 */
        .directive('loading', function () {
            return {
                // scope: {},
                restrict: 'AE',
                template: '<div class="cg-busy-default-wrapper" ng-show="loading"><div class="cg-busy-mask"></div><div class="cg-busy-default-sign"><div class="cg-busy-default-spinner"><img src="images/loading.svg" alt="loading" /></div></div></div>',
                // template: '<div class="cg-busy-default-wrapper" ng-show="loading"><div class="cg-busy-mask"></div><div class="cg-busy-default-sign"><div class="cg-busy-default-spinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div><div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div></div><div class="cg-busy-default-text">请稍候...</div></div></div>',
                link: function ($scope, elm, attrs) {

                }

            };
        });
});








