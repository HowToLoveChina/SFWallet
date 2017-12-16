/**
 * Created by SF on 7/11/16.
 */
define( function (require) {
    var app=require("../app");
    require("../factory/Register");
    require("../factory/verify");
    require("../factory/VerifyCodeService");
    require("filter");
    require("../directive/directive");
    /*
     绑定控制器
     */
   app
        .controller('BindCtrl', ['$scope', '$rootScope','$state',
            'isRegistedService', 'NirvanaUtil', 'bindRoute', 'StorageDataService', 'Toast', function($scope, $rootScope,$state, isRegistedService, NirvanaUtil, bindRoute, StorageDataService, Toast){
            $scope.goBack = function(){
                NirvanaUtil.doBack(0);
            };
            window.doKeyBack = function(){
                $scope.goBack();
            };
            $rootScope.loading = false;
            $scope.obj = {
                phoneNumber:"",//手机号
                accept:true//是否同意
            };
            var tel = StorageDataService.getBindDateByKey('phoneNumber');
            if(tel != null && tel != 'undefined' && tel != ''){
                $scope.obj.phoneNumber = tel;
            }else{
                $scope.obj.phoneNumber = $rootScope.userMobile;//从商户带来的手机号，即userMobile;
            }

            /*  "技术支持"提示文字  */
            var scrollHeight=document.body.scrollHeight;
            window.onresize = function(){
                if (document.body.scrollHeight) {
                    if(document.body.scrollHeight < scrollHeight){
                        $(".footer").hide();
                    }else{
                        $(".footer").show();
                    }
                }else{
                    $('input').focus(function(){
                        $(".footer").hide();
                    }).blur(function(){
                        var t=setTimeout(function(){
                            $(".footer").show();
                        },300)
                    });
                }
            };
            $(window).resize();

            $scope.next = function(){
                var _phoneNumber = $scope.obj.phoneNumber;

                if(!/^1\d{10}$/.test(_phoneNumber)){
                    Toast.show('输入的手机号码不正确！');
                    return;
                }

                var parmas = {
                    userMobile:$rootScope.userMobile,
                    merchantId:$rootScope.merchantId,
                    userId:$rootScope.userId,
                    userName:$rootScope.userName,
                    mobile:_phoneNumber//用户修改后的手机号
                };

                $rootScope.loading = true;
                //是否已经顺手付会员
                isRegistedService.query(parmas)
                    .success(function(response){
                        if (response.rltCode == '00' && response.data) {
                            $rootScope.userMobile = _phoneNumber;
                            var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            //1-会员未注册   2-未实名、3-未绑储蓄卡、4-未开通代扣绑定、5-已开通代扣绑定、6-已经注册未设置支付密码
                            var memberFlag = data.memberFlag;
                            //缓存顺手付帐号
                            StorageDataService.setBindDate('phoneNumber', $scope.obj.phoneNumber);
                            StorageDataService.setBindDate('memberFlag', memberFlag);
                            //手机号改变，需要手机短信验证
                            if($scope.obj.phoneNumber != $rootScope.userMobile){
                                $state.go("bindVerify");//验证手机短信
                            }else{
                                bindRoute.go();
                            }
                        } else {
                            Toast.show(response.rltMsg);
                        }
                        $rootScope.loading = false;
                    })
                    .error(function(response){
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            };

            //查看协议
            $scope.openSfpayProtocal = function(){
                $state.go('sfpayProtocal');
                StorageDataService.setBindDate('phoneNumber', $scope.obj.phoneNumber);
            }

        }])
        /*设置支付密码 hash:bindSetPayPwd*/
        .controller('setPayPwdCtrl', ['foundPayPwdSuccessRoute','$scope',
            '$rootScope','$state','passwordService', 'NirvanaUtil', 'payPasswordService',
            'resetPayPwdService', 'payPasswordRegisterService', 'StorageDataService', 'Toast','$compile','$document', function(foundPayPwdSuccessRoute,$scope, $rootScope,$state,passwordService,NirvanaUtil, payPasswordService, resetPayPwdService, payPasswordRegisterService, StorageDataService, Toast,$compile,$document){
            $scope.goBack = function(){
                showAlertView("确定放弃设置支付密码？");
            };
            window.doKeyBack = function(){
                $scope.goBack();
            };
            var isRegister = $rootScope.params_bindSetPayPwd.isRegister;
            var mobile = $rootScope.params_bindSetPayPwd.mobile;
            var userName = $rootScope.params_bindSetPayPwd.userName;
            var idCardNo = $rootScope.params_bindSetPayPwd.idCardNo;
            var credentialsType = $rootScope.params_bindSetPayPwd.credentialsType;
            //再次密码验证
            $scope.verifyPwd = function(){
                var newPwd = $scope.payPassword;
                var r = passwordService.check(newPwd, newPwd);
                if(r != 0){
                    clearPwd();
                    return ;
                }
                $rootScope.params_setRePayPwd = {
                    mobile:mobile,newPwd:newPwd,
                    isRegister:isRegister,userName:userName,idCardNo:idCardNo,credentialsType:credentialsType
                }
                $('.pwd-input').blur();
                $state.go('setRePayPwd');
            };
            //清除密码
            function clearPwd(){
                $scope.payPassword = "";
                $('#pwd-list').find('li').removeClass('finished');
            }
            var bbBox = null;
            function showAlertView(msg){
                if(bbBox != null){
                    bbBox.remove();
                }
                msg = msg.replace(/\s+/g,"");
                bbBox = $compile('<bb-confirm msg='+msg+' ok-callback="endFunc()"></bb-confirm>')($scope);
                $document.find('body').append(bbBox);
            }

            $scope.endFunc = function(){
                bbBox.remove();
                if(isRegister == 'Y'){//注册绑定签约流程
                    $state.go('bind');
                    return;
                }
                // 找回支付密码流程中断要清除缓存的verifyCode
                if (sessionStorage.oneValidateCode != "" && sessionStorage.oneValidateCode != null) {
                    sessionStorage.oneValidateCode = "";
                }
                foundPayPwdSuccessRoute.go();
            }
        }])
        /*设置支付密码第二次输入 hash:bindSetPayPwd*/
        .controller('setRePayPwdCtrl', ['foundPayPwdSuccessRoute','$scope', '$rootScope','$state',
            'passwordService', 'NirvanaUtil', 'payPasswordService', 'resetPayPwdService', 'payPasswordRegisterService',
            'StorageDataService', 'Toast','$compile','$document', function(foundPayPwdSuccessRoute,$scope, $rootScope,$state,passwordService,NirvanaUtil, payPasswordService, resetPayPwdService, payPasswordRegisterService, StorageDataService, Toast,$compile,$document){
            $scope.goBack = function(){
                showAlertView("确定放弃设置支付密码？");
            };
            window.doKeyBack = function(){
                $scope.goBack();
            }
            var newPwd = $rootScope.params_setRePayPwd.newPwd;
            var isRegister = $rootScope.params_setRePayPwd.isRegister;
            var mobile = $rootScope.params_setRePayPwd.mobile;
            var userName = $rootScope.params_setRePayPwd.userName;
            var idCardNo = $rootScope.params_setRePayPwd.idCardNo;
            var credentialsType = $rootScope.params_setRePayPwd.credentialsType;

            var rePwd = '';
            var bbBox = null;
            function showAlertView(msg){
                if(bbBox != null){
                    bbBox.remove();
                }
                msg = msg.replace(/\s+/g,"");
                bbBox = $compile('<bb-confirm msg='+msg+' ok-callback="endFunc()"></bb-confirm>')($scope);
                $document.find('body').append(bbBox);
            }

            $scope.endFunc = function(){
                bbBox.remove();
                if(isRegister == 'Y'){//注册绑定签约流程
                    $state.go('bind');
                    return;
                }
                // 找回支付密码流程中断要清除缓存的verifyCode
                if (sessionStorage.oneValidateCode != "" && sessionStorage.oneValidateCode != null) {
                    sessionStorage.oneValidateCode = "";
                }
                foundPayPwdSuccessRoute.go();
            };
            //跳回首次输入密码界面
            function goBindSetPayPwd(){
                $rootScope.params_bindSetPayPwd = {
                    mobile:mobile,isRegister:isRegister,userName:userName,idCardNo:idCardNo,credentialsType:credentialsType
                }
                $state.go('bindSetPayPwd');
            }
            //清除密码
            function clearPwd(){
                $scope.payPassword = "";
                $('#pwd-list').find('li').removeClass('finished');
            }
            $scope.verifyPwd = function() {
                rePwd = $scope.payPassword;
                if (newPwd != rePwd) {
                    Toast.show('两次输入不一致，请重新设置');
                    goBindSetPayPwd();
                }else{
                    //用户账户
                    var registerPhoneNumber;
                    if(mobile != null && mobile != ''){
                        registerPhoneNumber = mobile;
                    }else{
                        registerPhoneNumber = sessionStorage.sfPayAccount;
                    }
                    // 支付密码
                    // var oldPassword = $(".numkeyboard").get(0).value;
                    // var newPassword = $(".numkeyboard").get(1).value;
                    // var oldPassword = $scope.oldPassword;
                    // var newPassword = $scope.newPassword;

                    //对密码的合法性验证
                    var r = passwordService.check(newPwd, rePwd);
                    if(r != 0){
                        clearPwd();
                        return ;
                    }
                    //$(".auth_keybord").hide();

                    //设置支付密码+众包用户注册
                    if(isRegister == 'Y'){//未注册
                        registerAndSetPayPwd(registerPhoneNumber, newPwd);
                    } else if (isRegister == 'N_RESETPAYPWD') {//已经注册，未设置支付密码
                        resetPayPwd(registerPhoneNumber, newPassword);
                    } else {//忘记支付密码
                        setPayPwd(registerPhoneNumber, newPwd, rePwd,userName,idCardNo,credentialsType);
                    }
                }

            };

            function registerAndSetPayPwd(registerPhoneNumber, oldPassword){
                $rootScope.loading = true;
                payPasswordRegisterService.set(registerPhoneNumber, oldPassword)
                    .success(function(response) {
                        if (response.rltCode == '00' && response.data) {
                            //var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            $rootScope.isRegister = 'Y';
                            $state.go("bankcardAdd");//是从注册到添卡，如果返回键，则要跳过重复设置支付密码和注册。
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            goBindSetPayPwd();
                        }
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    }).error(function(response) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            }

            //设置支付密码，需要短信验证码参数，用于忘记支付密码
            function setPayPwd(registerPhoneNumber, oldPassword, newPassword,userName,idCardNo,credentialsType){
                $rootScope.loading = true;
                var verifyCode = "";
                if (sessionStorage.oneValidateCode!= "" && sessionStorage.oneValidateCode != null) {
                    verifyCode = sessionStorage.oneValidateCode;
                }
                payPasswordService.set(registerPhoneNumber, verifyCode,oldPassword, newPassword,userName,idCardNo,credentialsType)
                    .success(function(response) {

                        if (response.rltCode == '00' && response.data) {
                            if (verifyCode != "" && verifyCode != null) {
                                sessionStorage.oneValidateCode = "";
                            }
                            foundPayPwdSuccessRoute.go();
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            goBindSetPayPwd();
                        }
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    }).error(function(response) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            }
            //重置支付密码，不需要短信验证码参数
            function resetPayPwd(mobile, password){
                $rootScope.loading = true;
                resetPayPwdService.set(mobile, password)
                    .success(function(response) {
                        if (response.rltCode == '00' && response.data) {
                            //var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            $rootScope.isRegister = 'Y';
                            $state.go("bankcardAdd");//可以避免重新回到这个界面
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    }).error(function(response) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            }
        }])
        /*绑定流程，未绑定的帐号需要验证短信验证码 hash:bindVerify*/
        .controller('bindVerifyCtrl', ['$scope', '$rootScope', '$state',
            'VerifyCodeService', 'StorageDataService', 'bindRoute', 'Toast', function($scope, $rootScope, $state,VerifyCodeService, StorageDataService, bindRoute, Toast){
            $scope.goBack = function(){
                // window.history.back();
                $state.go('bind');
            };
            window.doKeyBack = function(){
                // window.history.back();
                $state.go('bind');
            };
            $scope.obj = {
                validCode:''
            };

            var memberFlag = StorageDataService.getBindDateByKey('memberFlag');

            $scope.phoneNumber = StorageDataService.getBindDateByKey('phoneNumber');

            //自动倒计时
            $scope.autoSend = true;

            //重发短信接口
            $scope.send = function(){
                $rootScope.loading = true;
                VerifyCodeService.send($scope.phoneNumber, '8').then(function(data) {
                    $rootScope.loading = true;
                    if(data.status == 200){
                        // 成功,触发下发倒计时
                        $rootScope.loading = false;
                        // 开始倒计时
                        $scope.autoSend = true;
                    }
                },function(error) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            };
            $scope.send();
            //下一步
            $scope.next = function () {
                var verifyCode = $scope.obj.validCode;
                $rootScope.loading = true;
                VerifyCodeService.verify($scope.phoneNumber,verifyCode,'8').then(function(data) {
                    $rootScope.loading = false;
                    if (data.data.rltCode == "00" && data.data) {
                        bindRoute.go();
                    } else {
                        Toast.show(data.data.rltMsg);
                    }
                },function(error) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            };
        }])
        /*绑定成功 hash:bindSuccess*/
        .controller('BindSuccessCtrl', ['$scope','$rootScope', 'NirvanaUtil', 'StorageDataService', function($scope,$rootScope,NirvanaUtil, StorageDataService){

            $scope.phoneNumber = StorageDataService.getBindDateByKey('phoneNumber');//顺手付账号

            $scope.finish = function () {
                NirvanaUtil.clearAddBankCardCache();
                NirvanaUtil.doBack(1);
            };

            window.doKeyBack = function(){
                $scope.finish();
            };

           if($rootScope.app == 'o2oRN'){//添加用来识别是否是新版本RN开发模式
               try {WebViewBridge.send("bindSuccess");}catch (e) {}
           }else{
               try {FinishInterface.doBackgroudBusiness(1);} catch (e) {}
           }

        }]);
});