/**
 * Created by SF on 7/11/16.
 */

define(function (require) {
   var app=require("../app");
   require("../factory/formatNum");
   require("../factory/walletHttp");
   require("../directive/directive");
    app
    .controller('inputpwdCtrl', ['checkPayBankSmsService','unbindBankCardService','FormatNum','StorageDataService','$rootScope','$scope','$state','$http',
        'appSyRechargeService','withDrawService','NirvanaUtil','Toast', '$compile','$document', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW',
        function(checkPayBankSmsService,unbindBankCardService,FormatNum,StorageDataService,$rootScope,$scope,$state,$http,appSyRechargeService,withDrawService,NirvanaUtil,Toast,$compile,$document, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW){
            $scope.goBack = function(){
                if($rootScope.unBindCardPro){
                    $rootScope.unBindCardPro = false;
                    $state.go('cardDetail');
                    //window.history.back();
                }else{
                    _confirm();
                }

            };
            window.doKeyBack = function(){
                $scope.goBack();
            };
            $scope.inpType = true;
            var bbBox = null;

            var inputpwdData = StorageDataService.getInputPwdParam();
            var	paymentObj = inputpwdData.paymentObj;
            var	walletType = inputpwdData.walletType;
            // var	amt = inputpwdData.amt * 100;
            var amt = FormatNum.countNum(inputpwdData.amt * 1,100,'*');
            var signNo = "";
            if(paymentObj != null){
                signNo = paymentObj.signNo;
            }
            var password = '';
            var tradeScene = '';
            if(walletType == 2){
                tradeScene = TRADESCENE_WITHDRAW;
            }else{
                tradeScene = TRADESCENE_RECHARGE;
            }
            $scope.okFn = function(){
                bbBox.remove();
                if(walletType == 2){
                    $state.go('walletCash');
                }else if(walletType == 1){
                    $state.go('walletRecharge');
                }else{
                    window.history.back();
                }
            };
            //$('.pwd-input').focus();
            $scope.getPwdFn = function(){
                bbBox.remove();
                $scope.findPayPwdAccountFunc();
            };
            $scope.reInputPwd = function(){
                bbBox.remove();
                $('.pwd-input').focus();
            };
            function alert(alertMsg){
                if(bbBox != null){
                    bbBox.remove();
                }
                alertMsg = alertMsg.replace(/\s+/g,"");
                bbBox = $compile('<bb-alert msg='+alertMsg+'></bb-alert>')($scope);
                $document.find('body').append(bbBox);
            }
            function _confirm(){
                if(bbBox != null){
                    bbBox.remove();
                }
                if(walletType == 2){
                    bbBox = $compile('<bb-confirm msg="您确定取消提现吗？" ok-callback="okFn()"></bb-confirm>')($scope);
                }else{
                    bbBox = $compile('<bb-confirm msg="您确定取消充值吗？" ok-callback="okFn()"></bb-confirm>')($scope);
                }
                $document.find('body').append(bbBox);
            }
            function confirm(alertMsg){
                if(bbBox != null){
                    bbBox.remove();
                }
                alertMsg = alertMsg.replace(/\s+/g,"");
                bbBox = $compile('<bb-confirm msg='+alertMsg+' conleft="重新输入" conright="忘记密码" warn-callback="reInputPwd()" ok-callback="getPwdFn()"></bb-confirm>')($scope);
                $document.find('body').append(bbBox);
            }

            //支付
            $scope.verifyPwd = function(){
                password = $scope.payPassword;
                if($rootScope.unBindCardPro){
                    unbindBankCard(password);
                    return;
                }
                if(walletType == 2){//提现
                    walletCash();
                }else{
                    // paymentObj.bankSendSMS = 'true';
                    if('Y' == paymentObj.isConfirmBankSms){//调用确认接口，查询是否需要发送（3.24	检查支付是否需要银行发送短信接口）
                        checkPayBankSms(password);
                    }else {
                        if ('true' == paymentObj.bankSendSMS) {
                            $rootScope.params_verifyQuickPay = {
                                payment: paymentObj,
                                payPassword: password,
                                payCode: 1,
                                amt: amt,
                                tradeScene: tradeScene
                            }
                            $('.pwd-input').blur();
                            $state.go("verifyQuickPay");
                        } else {
                            walletRecharge();

                        }
                    }
                }
            }
            /**
             * 3.24	检查支付是否需要银行发送短信(161129版本添加)
             */
            function checkPayBankSms(password){
                $rootScope.loading = true;
                checkPayBankSmsService.checkPayBankSms(amt,signNo).success(function(response){
                    $rootScope.loading = false;
                    if(response.rltCode == '00'){
                        var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                        if(data.isBankSendSms == 'Y'){//是否银行发送，取值如下：Y:需要银行发送 N:不需要
                            paymentObj.bankSendSMS = 'true';
                            $rootScope.params_verifyQuickPay = {
                                payment:paymentObj,
                                payPassword:password,
                                payCode:1,
                                amt:amt,
                                tradeScene:tradeScene
                            }
                            $state.go("verifyQuickPay");
                        }else{
                            if('true' == paymentObj.bankSendSMS){
                                $rootScope.params_verifyQuickPay = {
                                    payment:paymentObj,
                                    payPassword:password,
                                    payCode:1,
                                    amt:amt,
                                    tradeScene:tradeScene
                                }
                                $state.go("verifyQuickPay");
                            }else{
                                walletRecharge();
                            }
                        }
                    }else if(response.rltCode == "14003"){
                        confirm(response.rltMsg);
                    }else{
                        Toast.show(response.rltMsg);
                    }
                }).error(function(response){
                    $rootScope.loading = false;
                    Toast.show('服务请求异常');
                });
            }
            /**
             * 解绑银行卡
             */
            function unbindBankCard(password){
                $rootScope.loading = true;
                unbindBankCardService.unbindBankCard($rootScope.signNo,password).success(function(response){
                    $rootScope.loading = false;
                    console.log("response:" + response.rltCode);
                    $('.pwd-input').blur();
                    if(response.rltCode == '00'){
                        $rootScope.unBindCardPro = false;
                        Toast.show('解绑成功');
                        $state.go('bankList');
                    }else if(response.rltCode == "14003"){
                        confirm(response.rltMsg);
                    }else{
                        Toast.show(response.rltMsg);
                    }
                }).error(function(response){
                    $rootScope.loading = false;
                    Toast.show('服务请求异常');
                });
            }

            //提现
            function walletCash(){
                //创建提现订单再进去支付
                $rootScope.loading = true;
                var bankCardId = signNo;
                var remark = "";
                withDrawService.withDraw(bankCardId,amt,password,remark)
                    .success(function(response, status, headers, config) {
                        $rootScope.loading = false;
                        $('.pwd-input').blur();
                        if (response.rltCode == "00") {
                            var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            $rootScope.payOkObj = {
                                'data':data,'amt':amt,'payCode':2
                            }
                            $state.go('payOk');
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else if(response.rltCode == "14003"){
                            confirm(response.rltMsg);
                        }else{
                            alert(response.rltMsg);
                        }
                    }).error(function(response, status, headers, config) {
                    alert(response.rltMsg);
                    $rootScope.loading = false;
                });
            }
            //充值
            function walletRecharge(){
                $rootScope.loading = true;
                var authNo = signNo;
                var ccy = "RMB";
                var smsCode = "";
                var verifyRef = "";
                var bankSendSms = paymentObj.bankSendSMS;
                appSyRechargeService.appSyRecharge(
                    authNo,password,amt,ccy,smsCode,verifyRef,bankSendSms)
                    .success(function(response, status, headers, config) {
                        $rootScope.loading = false;
                        $('.pwd-input').blur();
                        if (response.rltCode == "00") {
                            var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            $rootScope.payOkObj = {
                                'data':data,'amt':amt,'payCode':1
                            }
                            $state.go('payOk');
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else if(response.rltCode == "14003"){
                            confirm(response.rltMsg);
                        }else{
                            alert(response.rltMsg);
                        }
                    }).error(function(response, status, headers, config) {
                    alert(response.rltMsg);
                    $rootScope.loading = false;
                });
            }

            $scope.findPayPwdAccountFunc = function(){
                StorageDataService.setParam('toGetPwdCode',1);
                $state.go('findPayPwdAccount');
            }


        }])
});