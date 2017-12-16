/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/verify");
    require("../factory/VerifyCodeService");
    require("../factory/authHttpService");
    require("../directive/directive");

    app
        .controller('updateMobileSmsCtrl', ['foundPayPwdSuccessRoute','StorageDataService','$document',
            '$compile','VerifyCodeService','Toast','authHttpService','NirvanaUtil','$rootScope','$scope','$state',
            function(foundPayPwdSuccessRoute,StorageDataService,$document,$compile,VerifyCodeService,Toast,authHttpService,NirvanaUtil,$rootScope, $scope,$state){
                $scope.goBack = function(){
                    // window.history.back();
                    showAlertView("您确定放弃更换手机号?");
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                var newMobile = $rootScope.newMobile;

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
                    if (sessionStorage.oneValidateCode != "" && sessionStorage.oneValidateCode != null) {
                        sessionStorage.oneValidateCode = "";
                    }
                    foundPayPwdSuccessRoute.go();
                };



                // 下发短信验证码方法
                function send_sms(telephoneNum,scenceCode) {
                    // body...

                    //手机号码校验
                    if (telephoneNum != null && telephoneNum != "") {
                        $rootScope.loading = true;
                        VerifyCodeService.send(telephoneNum,scenceCode).then(function(data) {
                            // body...
                            // 成功,触发下发倒计时
                            $rootScope.loading = false;
                            // 开始倒计时
                            $scope.sms_count_down = true;
                        },function(error) {
                            // body...
                            // 失败,弹窗提示

                        });
                    } else {

                    }


                }
                // 下发短信
                send_sms(newMobile,'11');


                // 重新发送短信验证码
                $scope.sendAgainFunc = function() {
                    // body...
                    send_sms(newMobile,'11');
                }

                // 验证短信验证码
                $scope.validateSmsCodeFunc = function() {
                    // body...
                    verifyCode = $scope.verifyCode;

                    $rootScope.loading = true;
                    VerifyCodeService.verify(newMobile,verifyCode,'11').then(function(data) {
                        // body...

                        if (data.data.rltCode == "00" && data.data) {
                            // var dec_data = NirvanaUtil.decryptRespone(data.data.data,data.data.responseTime);
                            $rootScope.updateMobile.verify = verifyCode;
                            updateSypayLoginName();
                        } else {
                            $rootScope.loading = false;
                            Toast.show(data.data.rltMsg);
                        }
                    },function(error) {
                        // body...
                        // 失败,弹窗提示
                        $rootScope.loading = false;
                    });
                }
                //更新手机号
                function updateSypayLoginName(){
                    authHttpService.updateSypayLoginName($rootScope.updateMobile.mobile,
                        $rootScope.updateMobile.newMobile,
                        $rootScope.updateMobile.verify,
                        $rootScope.updateMobile.userName,
                        $rootScope.updateMobile.cardType,
                        $rootScope.updateMobile.idCard,
                        $rootScope.updateMobile.payPwd)
                        .success(function(response){
                            $rootScope.loading = false;
                            if(response.rltCode == '00'){
                                Toast.show('手机号更换成功');
                                $rootScope.userMobile = $rootScope.updateMobile.newMobile;
                                $state.go('account');
                            }else if(response.rltCode == '14021'){
                                $state.go('accountErr');
                            }else{
                                Toast.show(response.rltMsg);
                            };
                        }).error(function(response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
                }
            }])


});