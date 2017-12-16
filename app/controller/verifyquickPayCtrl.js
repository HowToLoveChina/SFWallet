/**
 * Created by SF on 7/11/16.
 */
define(function (require) {
    var app=require("../app");
    require("../factory/quickPayService");
    require("../factory/walletHttp");
    require("../factory/sendPaySmsService");
    require("filter");
    require("../directive/directive");
    require("../factory/VerifyCodeService");
    app
        .controller('verifyquickPayCtrl', ['quickPayService','appSyRechargeService','StorageDataService','$rootScope','$scope','$state','$http', 'sendPaySmsService','NirvanaUtil','Toast', '$compile','$document','TRADESCENE_PAY',
            function(quickPayService,appSyRechargeService,StorageDataService,$rootScope,$scope,$state,$http,sendPaySmsService,NirvanaUtil,Toast, $compile,$document,TRADESCENE_PAY){
                $scope.goBack = function(){
                    // window.history.back();
                    _confirm();
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                var bbBox = null;
                $scope.okFn = function(){
                    bbBox.remove();
                    if(null == businessNo){//充值过来的
                        $state.go('walletRecharge');
                    }else{//缴纳和充值直接返回
                        window.history.back();
                        // NirvanaUtil.doBack();
                    }
                };
                $scope.getPwdFn = function(){
                    bbBox.remove();
                    if(payCode == 1){
                        StorageDataService.setParam('toGetPwdCode',payCode);
                    }else{
                        StorageDataService.setParam('toGetPwdCode',payCode - 1);
                    }
                    $state.go('findPayPwdAccount');
                }
                $scope.reInputPwd = function(){
                    window.history.back();
                }
                function alert(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    bbBox = $compile('<bb-alert msg='+alertMsg+'></bb-alert>')($scope);
                    $document.find('body').append(bbBox);
                };
                function confirm(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-confirm msg='+alertMsg+' conleft="重新输入" conright="忘记密码" warn-callback="reInputPwd()" ok-callback="getPwdFn()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };
                function _confirm(){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    if(null == businessNo){
                        bbBox = $compile('<bb-confirm msg="您确定取消充值吗？" ok-callback="okFn()"></bb-confirm>')($scope);
                    }else{
                        bbBox = $compile('<bb-confirm msg="您确定取消支付吗？" ok-callback="okFn()"></bb-confirm>')($scope);
                    }
                    $document.find('body').append(bbBox);
                };

                var quick_obj = $rootScope.params_verifyQuickPay.payment;
                $scope.bankModel = quick_obj;
                var amt = $rootScope.params_verifyQuickPay.amt;
                var password = $rootScope.params_verifyQuickPay.payPassword;
                var businessNo = $rootScope.params_verifyQuickPay.businessNo;
                var payCode = $rootScope.params_verifyQuickPay.payCode;
                var tradeScene = $rootScope.params_verifyQuickPay.tradeScene;
                var verifyRef = "";
                var new_dynamicFields = "";
                function sendPaySms(){
                    $rootScope.loading = true;
                    var remark = '';
                    var bankSendSMS = quick_obj.bankSendSMS;
                    var signNo = quick_obj.signNo;
                    var cardType = quick_obj.cardType;
                    var bankCode = quick_obj.bankCode;
                    var sfBankCode = quick_obj.sfBankCode;
                    var bankName = quick_obj.bankName;
                    var dynamicFields = new_dynamicFields;
                    var smsMode = quick_obj.smsMode;
                    sendPaySmsService.sendPaySms(remark, bankSendSMS, businessNo,
                        signNo,
                        cardType,
                        bankCode,
                        sfBankCode,
                        bankName,
                        dynamicFields,
                        amt,
                        tradeScene).
                    success(function(response) {
                        if(response.rltCode == '00'){
                            // Toast.show("短信验证码已发送");
                            $scope.sendFlag = true;
                            $scope.validateField = false;
                            var smsResult = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            verifyRef = smsResult.verifyRef;
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            Toast.show(response.rltMsg);
                        }
                        $rootScope.loading = false;
                    }).error(function(response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
                }
                sendPaySms();
                //发支付短信接口
                $scope.send = function(){
                    sendPaySms();
                }
                $scope.obj = {
                    smsCode:''
                };
                $scope.next = function(){
                    $rootScope.loading = true;
                    var smsCode = $scope.obj.smsCode;
                    if(null == businessNo){//充值过来的
                        var authNo = quick_obj.signNo;
                        var ccy = "RMB";
                        var bankSendSms = quick_obj.bankSendSMS;
                        appSyRechargeService.appSyRecharge(
                            authNo,password,amt,ccy,smsCode,verifyRef,bankSendSms)
                            .success(function(response, status, headers, config) {
                                $rootScope.loading = false;
                                if (response.rltCode == "00") {
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':amt,'payCode':payCode
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
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                    }else{
                        var tradeScene = TRADESCENE_PAY;
                        var authNo = quick_obj.signNo;
                        var cardType = quick_obj.cardType;
                        var bankCode = quick_obj.bankCode;
                        var sfBankCode = quick_obj.sfBankCode;
                        var bankName = quick_obj.bankName;
                        var dynamicFields = quick_obj.dynamicFields;
                        var smsMode = quick_obj.smsMode;
                        var remark = '';
                        quickPayService.pay(businessNo,authNo,password,smsCode,smsMode,verifyRef,
                            remark,cardType,bankCode,sfBankCode,bankName,dynamicFields,tradeScene)
                            .success(function(response, status, headers, config) {
                                $rootScope.loading = false;
                                if (response.rltCode == "00") {
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':$rootScope.amt,'payCode':payCode
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
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                    }

                }
            }]);
});