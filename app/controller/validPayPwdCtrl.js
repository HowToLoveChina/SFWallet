/**
 * Created by SF on 7/19/16.
 */


define( function (require) {
    var app=require("../app");
    require("../directive/directive");
    require("../factory/authHttpService");
    require("../factory/FindPayPwdService");
    app
        .controller('validPayPwdCtrl', ['authHttpService','StorageDataService','$document','$compile',
            'findPayPwdService','Toast','NirvanaUtil','$rootScope','$scope','$state',
            function(authHttpService,StorageDataService,$document,$compile,findPayPwdService,Toast,NirvanaUtil,$rootScope, $scope,$state){
                $scope.goBack = function(){
                    window.history.back();
                };
                window.doKeyBack = function(){
                    window.history.back();
                }
                var bbBox = null;
                var realStatus = '';
                $scope.getPwdFn = function(){
                    bbBox.remove();
                    StorageDataService.setParam('toGetPwdCode',6);
                    $state.go('findPayPwdAccount');
                }
                $scope.reInputPwd = function(){
                    bbBox.remove();
                    $('.pwd-input').focus();
                }
                function confirm(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-confirm msg='+alertMsg+' conleft="重新输入" conright="忘记密码" warn-callback="reInputPwd()" ok-callback="getPwdFn()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };
                function alert(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-alert msg='+alertMsg+'></bb-alert>')($scope);
                    $document.find('body').append(bbBox);
                };

                // 查询用户注册实名状态
                checkUserRegisterStatus($rootScope.userMobile);
                function checkUserRegisterStatus(telephoneNum) {
                    // body...
                    $rootScope.loading = true;
                    findPayPwdService.checkUserRegisterStatus(telephoneNum).then(function(data) {
                        // body...
                        $rootScope.loading = false;

                        if (data.data.rltCode == '00') {
                            var obj = NirvanaUtil.decryptRespone(data.data.data,data.data.responseTime);
                            realStatus = obj.auth;
                        }
                    },function(error) {

                    });
                }

                //输入支付密码验证
                $scope.verifyPwd = function(){
                    $rootScope.loading = true;
                    var payPwd = $scope.payPassword;
                    authHttpService.validatePayPwdUpdateMobile($rootScope.userMobile,payPwd)
                        .success(function(response){
                            $rootScope.loading = false;
                            if(response.rltCode == '00'){
                                $('.pwd-input').blur();
                                $rootScope.updateMobile.payPwd = payPwd;
                                if (realStatus == '0') {//已实名
                                    StorageDataService.setParam('toGetPwdCode',6);//实名认证信息填写入口标识
                                    $state.go('findPayPwdUserInfo');
                                } else if (realStatus == '1') {//未实名
                                    $state.go('updateMobile');
                                }
                            }else if(response.rltCode == "14003"){
                                confirm(response.rltMsg);
                            }else if(response.rltCode == '14021'){
                                $state.go('accountErr');
                            }else{
                                alert(response.rltMsg);
                            };
                        }).error(function(response) {
                        $rootScope.loading = false;
                        alert(response.rltMsg);
                    });
                }

            }])


})