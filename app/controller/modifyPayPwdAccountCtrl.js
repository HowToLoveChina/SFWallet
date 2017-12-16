/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    app
        .controller('modifyPayPwdAccountCtrl', ['$rootScope','$scope','$state',
            function($rootScope, $scope,$state){
                $scope.goBack = function(){
                    window.history.back();
                };
                window.doKeyBack = function(){
                    window.history.back();
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
                $scope.modifyPwdSMS = function(){
                    $rootScope.tel_number = accountId;
                    $state.go('modifyPayPwdSMS');
                }
            }
        ])
        

});