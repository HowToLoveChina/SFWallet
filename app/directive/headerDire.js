
define(['require','$', 'app'], function (require, $,app) {
	// var app = require('../app');
		app
	//所有页面头部（返回和标题）
			.directive('headTitle', ['$timeout','NirvanaUtil',function ($timeout,NirvanaUtil) {
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
						if(noTitle){
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
						}

					}
				}
		}]);
		
});








