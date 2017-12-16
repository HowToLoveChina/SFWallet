/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/FindPayPwdService");
    app
        .controller('updateMobileCtrl', ['findPayPwdService','$document','$compile','Toast','NirvanaUtil','$rootScope','$scope','$state',
            function(findPayPwdService,$document,$compile,Toast,NirvanaUtil,$rootScope, $scope,$state){
                $scope.goBack = function(){
                    // window.history.back();
                    showAlertView("您确定放弃更换手机号?");
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                var bbBox = null;
                function showAlertView(msg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    bbBox = $compile('<bb-confirm msg='+msg+' ok-callback="endFunc()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };
                $scope.endFunc = function(){
                    bbBox.remove();
                    // 找回支付密码流程中断要清除缓存的verifyCode
                    $state.go('account');
                };

                function checkUserRegisterStatus(telephoneNum) {
                    // body...
                    $rootScope.loading = true;
                    findPayPwdService.checkUserRegisterStatus(telephoneNum).then(function(data) {
                        // body...
                        $rootScope.loading = false;

                        if (data.data.rltCode == '00') {
                            var obj = NirvanaUtil.decryptRespone(data.data.data,data.data.responseTime);
                            if(obj.type == 1){
                                $rootScope.updateMobile.newMobile = telephoneNum;
                                $rootScope.newMobile = $scope.changeMobile;
                                $state.go('updateMobileSms');
                            }else{
                                Toast.show('该号码已注册，请更换手机号');
                            }
                        }else{
                            Toast.show(data.data.rltMsg);
                        }
                    },function(error) {

                    });
                }
                $scope.getVerify = function(){
                    // 查询用户注册实名状态
                    checkUserRegisterStatus($scope.changeMobile);
                }

            }])


});