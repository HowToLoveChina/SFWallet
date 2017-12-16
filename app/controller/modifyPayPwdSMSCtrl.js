/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/verify");
    require("../factory/VerifyCodeService");
    require("../factory/FindPayPwdService");
    require("../directive/directive");
    app
    .controller('modifyPayPwdSMSCtrl', ['foundPayPwdSuccessRoute','$rootScope','$scope','$state','$http',
        'VerifyCodeService', 'findPayPwdService','NirvanaUtil','$compile','$document','StorageDataService','Toast',
        function(foundPayPwdSuccessRoute,$rootScope,$scope,$state,$http,VerifyCodeService,findPayPwdService,NirvanaUtil,$compile,$document,StorageDataService,Toast){
            $scope.goBack = function(){
                window.history.back();
            };
            window.doKeyBack = function(){
                window.history.back();
            }
            $scope.goBack = function(){
                showAlertView("确定放弃修改支付密码？");
            };
            window.doKeyBack = function(){
                showAlertView("确定放弃修改支付密码？");
            }
            var tel_number = "";
            if ($rootScope.tel_number != "" && $rootScope.tel_number != null) {
                tel_number = $rootScope.tel_number;
                sessionStorage.teleNumber = $rootScope.tel_number;
            } else {
                tel_number = sessionStorage.teleNumber;
            }
            if (tel_number != null && tel_number != "") {
                $scope.accountNumber = tel_number.substr(0,3)+'****'+tel_number.substr(7);
            }
            var verifyCode = "";
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
                foundPayPwdSuccessRoute.go();

            }

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
            send_sms(tel_number,'3');


            // 重新发送短信验证码
            $scope.sendAgainFunc = function() {
                // body...
                send_sms(tel_number,'3');
            }

            // 验证短信验证码
            $scope.validateSmsCodeFunc = function() {
                // body...
                verifyCode = $scope.verifyCode;

                $rootScope.loading = true;
                VerifyCodeService.verify(tel_number,verifyCode,'3').then(function(data) {
                    // body...
                    $rootScope.loading = false;
                    if (data.data.rltCode == "00" && data.data) {
                        // 找回支付密码流程缓存verifyCode  解决安全问题保存短信验证码留到设置支付密码使用
                        sessionStorage.oneValidateCode = verifyCode;
                        // 成功,跳转至输入原密码验证
                        $state.go('inputOldPayPwd');
                    } else {
                        Toast.show(data.data.rltMsg);
                    }
                },function(error) {
                });
            }
        }
    ])

});