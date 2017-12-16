/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
   
    app
    /**
     * 找回支付密码
     */

    /*找回支付密码：账号信息*/
        .controller('findPayPwdAccountCtrl', ['$rootScope','$scope','$state','$http', function($rootScope,$scope,$state,$http){

            $scope.goBack = function(){
                window.history.back();
                sessionStorage.teleNumber = "";
            };
            window.doKeyBack = function(){
                window.history.back();
                sessionStorage.teleNumber = "";
            }

            var accountId = "";
            // 缓存要找回支付密码的手机号码
            if ($rootScope.userMobile != "" && $rootScope.userMobile != null) {
                accountId = $rootScope.userMobile;
                sessionStorage.teleNumber = accountId;
            } else {
                accountId = sessionStorage.teleNumber;
            }

            if (accountId != "" && accountId != null) {
                $scope.accountNumber =  accountId.substr(0,3) + "****" + accountId.substr(7);
            }

            // 找回支付密码
            $scope.findPwdNextFunc = function() {
                // body...
                var tel_number = accountId;
                $rootScope.userMobile = tel_number;
                $state.go('findPayPwdSMS');
            }
        }])
        /*找回支付密码：短信验证码*/
});