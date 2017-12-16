/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/VerifyCodeService");
    require("../factory/FindPayPwdService");
    require("../factory/verify");
    require("../directive/directive");
    app
    /**
     * 找回支付密码
     */
   
        /*找回支付密码：短信验证码*/
        .controller('findPayPwdSMSCtrl', ['$rootScope','$scope','$state','$http',
            'VerifyCodeService', 'findPayPwdService','NirvanaUtil','$compile','$document','StorageDataService', 'foundPayPwdSuccessRoute','Toast',function($rootScope,$scope,$state,$http,VerifyCodeService,findPayPwdService,NirvanaUtil,$compile,$document,StorageDataService, foundPayPwdSuccessRoute,Toast){

            $scope.goBack = function(){

                showAlertView("确定放弃找回支付密码？");
            };

            window.doKeyBack = function(){
                showAlertView("确定放弃找回支付密码？");
            };

            var tel_number = "";
            if ($rootScope.userMobile != "" && $rootScope.userMobile != null) {
                tel_number = $rootScope.userMobile;
                sessionStorage.teleNumber = $rootScope.userMobile;
            } else {
                tel_number = sessionStorage.teleNumber;
            }
            if (tel_number != null && tel_number != "") {
                $scope.accountNumber = tel_number.substr(0,3)+'****'+tel_number.substr(7);
            }


            var verifyCode = "";
            var realStatus = "";

            var bbBox = null;

            function showAlertView(msg){
                if(bbBox != null){
                    bbBox.remove();
                }
                bbBox = $compile('<bb-confirm msg='+msg+' ok-callback="endFunc()"></bb-confirm>')($scope);
                $document.find('body').append(bbBox);
            }

            $scope.endFunc = function(){
                bbBox.remove();
                foundPayPwdSuccessRoute.go();
            };

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
                    // body...


                });
            }
            // 查询用户注册实名状态
            checkUserRegisterStatus(tel_number);

            // 下发短信验证码方法
            function send_sms(telephoneNum,scenceCode) {
                // body...

                //手机号码校验
                if (!telephoneNum || telephoneNum == "") {
                    //Toast.show("手机号不存在!");
                    //return;
                    telephoneNum = '';
                }
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
            }
            // 下发短信
            send_sms(tel_number,'8');


            // 重新发送短信验证码
            $scope.sendAgainFunc = function() {
                // body...
                send_sms(tel_number,'8');
            }

            // 验证短信验证码
            $scope.validateSmsCodeFunc = function() {
                // body...
                verifyCode = $scope.verifyCode;

                $rootScope.loading = true;
                VerifyCodeService.verify(tel_number,verifyCode,'8').then(function(data) {
                    // body...
                    $rootScope.loading = false;
                    if (data.data.rltCode == "00" && data.data) {
                        // 找回支付密码流程缓存verifyCode  解决安全问题保存短信验证码留到设置支付密码使用
                        sessionStorage.oneValidateCode = verifyCode;
                        // 成功,跳转至验证身份信息界面
                        if (realStatus == '0') {//已实名
                            $rootScope.userMobile = tel_number;
                            $state.go('findPayPwdUserInfo');
                        } else if (realStatus == '1') {//未实名
                            $rootScope.params_bindSetPayPwd = {
                                mobile:tel_number
                            }
                            $state.go('bindSetPayPwd');
                        }
                    } else {
                        Toast.show(data.data.rltMsg);
                    }
                },function(error) {
                    // body...
                    // 失败,弹窗提示

                });
            }
        }])
        /*找回支付密码：验证身份信息*/
        .controller('findPayPwdUserInfoCtrl', ['foundPayPwdSuccessRoute','$rootScope','$scope','$state','$http', 
            'StorageDataService','Toast','findPayPwdService', 'NirvanaUtil','IDCard','$compile','$document',
            function(foundPayPwdSuccessRoute,$rootScope,$scope,$state,$http,StorageDataService,Toast,findPayPwdService, NirvanaUtil,IDCard,$compile,$document){

                $scope.goBack = function(){
                    // window.history.back();
                    if(StorageDataService.getParam('toGetPwdCode') == 6){
                        showAlertView("您确定放弃更换手机号?");
                    }else{
                        showAlertView("您确定放弃找回支付密码?");
                    }
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                if(StorageDataService.getParam('toGetPwdCode') == 6){
                    $scope.titleName = "更换手机号";
                }else{
                    $scope.titleName = "找回支付密码";
                }
                var phoneNum = "";
                var userName = "";
                var idCardNo = "";
                var credentialsType = "";

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
                };

                // 
                if ($rootScope.userMobile != "" && $rootScope.userMobile != null) {
                    phoneNum = $rootScope.userMobile;
                    sessionStorage.teleNumber = $rootScope.userMobile;
                } else {
                    phoneNum = sessionStorage.teleNumber;
                }

                //查询用户实名信息 
                function checkeRealNameStatus(phoneNum) {
                    // body...

                    $rootScope.loading = true;
                    findPayPwdService.checkeRealNameStatus(phoneNum).then(function (data) {
                        // body...
                        $rootScope.loading = false;
                        var obj = NirvanaUtil.decryptRespone(data.data.data,data.data.responseTime)
                        credentialsType = obj.certType;
                        $scope.userCardTypeInfoPlacer = obj.certContent;

                    },function (error) {
                        // body...

                    });

                }

                // 查询用户实名信息 
                checkeRealNameStatus(phoneNum);


                // 验证身份信息
                $scope.validateUserInfoFunc = function() {
                    // body...
                    userName = $scope.userNameInUserInfo;
                    idCardNo = $scope.cardId;
                    if (userName == "") {
                        Toast.show('请输入用户姓名');
                        return ;
                    }
                    if (credentialsType == '1') {
                        var res = IDCard.valid(idCardNo);
                        if (res != '0') {
                            Toast.show('请输入正确的身份证号码');
                            return;
                        }
                    } else {
                        if (idCardNo == '') {
                            Toast.show("港澳通行证或者护照号码不能为空");
                            return ;
                        };
                    }
                    $rootScope.loading = true;
                    findPayPwdService.validateUserInfo(phoneNum,userName,idCardNo,credentialsType).then(function (data) {
                        // body...
                        $rootScope.loading = false;
                        if (data.data.rltCode == '00') {
                            if(StorageDataService.getParam('toGetPwdCode') == 6){
                                $rootScope.updateMobile.userName = userName;
                                $rootScope.updateMobile.cardType = credentialsType;
                                $rootScope.updateMobile.idCard = idCardNo;
                                $state.go('updateMobile');
                            }else{
                                $rootScope.params_bindSetPayPwd = {
                                    mobile:phoneNum,userName:userName,idCardNo:idCardNo,credentialsType:credentialsType
                                }
                                $state.go('bindSetPayPwd');
                                // TODO:是否清除缓存的手机号码？？？？
                                sessionStorage.teleNumber = "";
                            }

                        } else {
                            Toast.show(data.data.rltMsg);
                        }

                    },function (error) {
                        // body...

                    });
                    // $state.go('bindSetPayPwd');
                }
            }])






});