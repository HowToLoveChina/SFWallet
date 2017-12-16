/**
 * Created by SF on 7/11/16.
 */
define(['require','app'],function (require,app) {
// define(function (require) {
//     var app = require('../app');
//     require('../factory/formatNum');
//     require('../factory/queryPayListService');
//    require("filter");
    app
        .controller('cardDetailCtrl', ['StorageDataService','$rootScope',
            '$scope','$state','$http','NirvanaUtil','Toast', 'TRADESCENE_RECHARGE',
            function(StorageDataService,$rootScope,$scope,$state,$http,NirvanaUtil,Toast, TRADESCENE_RECHARGE){

                $scope.goBack = function(){
                    // window.history.back();
                    StorageDataService.setParam('cardDetail',null);
                    //window.history.back();
                    $state.go('bankList');
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                };
                var payment_obj = StorageDataService.getParam('cardDetail');
                $scope.item=payment_obj;
                $rootScope.signNo = payment_obj.signNo;
                /**
                 * 点击解绑银行卡按钮
                 */
                $scope.unBindCardFunc = function(){
                    $rootScope.unBindCardPro = true;
                    $state.go('inputpwd');
                }

        }])


});