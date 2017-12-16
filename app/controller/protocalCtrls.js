
define( function (require) {
	var app=require("../app");
	app
		.controller('protocalCtrl', ['$rootScope','$scope', function($rootScope, $scope){
			$scope.goBack = function(){
				window.history.back();
			};
			window.doKeyBack = function(){
				$scope.goBack();
			};

			$rootScope.screenHeight=window.screen.height-55;
		}])
		//银行协议(hash:bankProtocal)
		.controller('bankProtocalCtrl', ['$rootScope','$scope', function($rootScope, $scope){
			$scope.goBack = function(){
				window.history.back();
			};
			window.doKeyBack = function(){
				$scope.goBack();
			};

			$rootScope.screenHeight=window.screen.height-55;

			$(document).ready(function(){
				$("#protocalIframe").attr("src", $rootScope.bankServiceUrl);
			});
		}]);






});