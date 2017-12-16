/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    app
        .controller('sfAccountCtrl', ['NirvanaUtil','$rootScope','$scope','$state',
            function(NirvanaUtil,$rootScope, $scope,$state){
                $scope.goBack = function(){
                    $state.go('securityHome');
                };
                window.doKeyBack = function(){
                    $state.go('securityHome');
                }

                $scope.changeBindMobile = function() {
                    $state.go('validPayPwd');
                }
                if($rootScope.userMobile){
                    var userMobile = "" + $rootScope.userMobile;
                    $scope.userMobileView = userMobile.substr(0,3) + "****" + userMobile.substr(7)
                }else{
                    $scope.userMobileView = $rootScope.userMobile
                }
                //该流程需要用的提交参数
                $rootScope.updateMobile = {
                    mobile:$rootScope.userMobile,
                    newMobile:'',
                    verify:'',
                    userName:'',
                    cardType:'',
                    idCard:'',
                    payPwd:''
                }
            }])

});