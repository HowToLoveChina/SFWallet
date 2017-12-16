/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/balanceOrPointPayService");
    require("../factory/formatNum");
    require("../factory/createOrderService");
    require("../factory/quickPayService");
    require("../directive/directive");
    app
        .controller('DepositSureCtrl', ['balanceOrPointPayService','FormatNum','StorageDataService','$rootScope','$scope','$state','$http',
            '$stateParams','createOrderService','quickPayService','NirvanaUtil','Toast', '$compile','$document','TRADESCENE_PAY',
            function(balanceOrPointPayService,FormatNum,StorageDataService,$rootScope,$scope,$state,$http,$stateParams,createOrderService,quickPayService,
                     NirvanaUtil,Toast,$compile,$document,TRADESCENE_PAY){
                $scope.goBack = function(){
                    NirvanaUtil.doBack(0);
                };
                window.doKeyBack = function(){
                    NirvanaUtil.doBack(0);
                }
                $scope.showCardFlag = false;
                var bbBox = null;
                $scope.okFn = function(){
                    bbBox.remove();
                    $state.go('findPayPwdAccount');
                }
                $scope.reInputPwd = function(){
                    bbBox.remove();
                    $('.pwd-input').focus();
                }
                $scope.getPwdFn = function(){
                    bbBox.remove();
                    $scope.findPayPwdAccountFunc();
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
                $scope.amt = FormatNum.fn_money($rootScope.amt);
                var payment_obj = null;
                // var data = null;
                var openId = $rootScope.openId;
                var merchantId = $rootScope.merchantId;
                var orderId  = $rootScope.orderId;
                var amt = $rootScope.amt;
                var ccy = $rootScope.ccy;
                var orderBeginTime = $rootScope.orderBeginTime;
                var goodsName = $rootScope.goodsName;
                var goodsDesc = $rootScope.goodsDesc;
                var goodsUrl = $rootScope.goodsUrl;
                var merBusinessType = $rootScope.merBusinessType;
                var reserved = $rootScope.reserved;
                var notifyUrl = $rootScope.notifyUrl;
                var clientIp = $rootScope.clientIp;
                var ext1 = $rootScope.ext1;
                var ext2 = $rootScope.ext2;
                var ext3 = $rootScope.ext3;
                var orderExpDate = $rootScope.orderExpDate;
                var businessType = $rootScope.businessType;
                var businessCode = $rootScope.businessCode==undefined?'':$rootScope.businessCode;
                var tradeScene = TRADESCENE_PAY;

                var businessNo = '';
                var smsMode = '';
                if(StorageDataService.getParam('createOrderData') == null){
                    createOrder();
                }else{
                    $scope.showCardFlag = true;
                    payment_obj = StorageDataService.getParam('paymentObj')
                    data = StorageDataService.getParam('createOrderData');
                    businessNo = data.businessNo;
                    if(payment_obj.type=="QUICK"){
                        smsMode  = payment_obj.smsMode;
                    }
                    initBankCard(payment_obj);
                }

                function createOrder(){
                    $rootScope.loading = true;
                    createOrderService.createOrder(merchantId,orderId,amt,ccy,orderBeginTime,goodsName,goodsDesc,goodsUrl,
                        merBusinessType,reserved,notifyUrl,
                        clientIp,ext1,ext2,ext3,orderExpDate,openId,tradeScene).success(function(response, status, headers, config) {
                        $rootScope.loading = false;
                        if (response.rltCode == "00") {
                            data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            StorageDataService.setParam('createOrderData',data);
                            payment_obj = data.paymentList[0];

                            if(payment_obj.type == 'BALANCE' && data.paymentList.length > 1){
                                if(payment_obj.balance < $rootScope.amt*1){//余额不够订单金额
                                    payment_obj = data.paymentList[1];
                                }
                                var _balanceQuota = payment_obj.balanceQuota*100;//余额限额
                                if(_balanceQuota > -1*100 && _balanceQuota < payment_obj.balance && _balanceQuota < $rootScope.amt*1){
                                    payment_obj = data.paymentList[1];
                                }
                            }

                            StorageDataService.setParam('paymentObj',payment_obj);
                            $rootScope.userMobile = response.mobile;
                            businessNo = data.businessNo;
                            if(payment_obj.type=="QUICK"){
                                smsMode  = payment_obj.smsMode;
                            }
                            if(payment_obj.type == "BALANCE" && payment_obj.balance < $rootScope.amt
                                && data.paymentList.length < 2){
                                $rootScope.sceneCode = tradeScene;
                                StorageDataService.setParam('toAddBankCode',5);
                                $rootScope.notWithholdSign = 'Y';
                                $state.go('bankcardAdd');
                                return;
                            }
                            $scope.showCardFlag = true;
                            initBankCard(payment_obj);
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            Toast.show(response.rltMsg);
                        }
                    }).error(function(response, status, headers, config) {
                        Toast.show(response.rltMsg);
                        $rootScope.loading = false;
                    });
                }
                $scope.verifyPwd = function() {
                    var password = $scope.payPassword;
                    var tradeScene = TRADESCENE_PAY;
                    var remark = "";
                    if('true' == payment_obj.bankSendSMS || payment_obj.dynamicFields != null){
                        var quick_obj = payment_obj;//快捷支付对象
                        $rootScope.params_verifyQuickPay = {
                            payment: payment_obj,
                            payPassword:$scope.payPassword,
                            businessNo:businessNo,
                            payCode:3,
                            amt:amt,
                            tradeScene:tradeScene
                        }
                        $state.go("verifyQuickPay");
                        return;
                    }

                    var payType = payment_obj.type;
                    //创建完订单后进行支付
                    $rootScope.loading = true;
                    if('BALANCE' == payType || 'POINT' == payType){
                        if(payType=="BALANCE"){
                            serviceName = "BALANCE_PAY";
                        }else if(payType=="POINT"){
                            serviceName = "POINT_PAY";
                        }
                        balanceOrPointPayService.pay(serviceName,businessNo,password,payType,remark,tradeScene)
                            .success(function(response, status, headers, config){
                                $rootScope.loading = false;
                                if (response.rltCode == "00") {
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':$rootScope.amt,'payCode':3
                                    }
                                    $state.go('payOk');
                                }else if(response.rltCode == '14021'){
                                    $state.go('accountErr');
                                }else if(response.rltCode == "14003"){
                                    confirm(response.rltMsg);
                                }else{
                                    alert(response.rltMsg);
                                }
                            }).error(function(response, status, headers, config){
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                    }else if('QUICK' == payType || null != payment_obj.cardType){
                        var authNo = payment_obj.signNo;
                        var smsCode = "";
                        var verifyRef = "";
                        var cardType = payment_obj.cardType;
                        var bankCode = payment_obj.bankCode;
                        var sfBankCode = payment_obj.sfBankCode;
                        var bankName = payment_obj.bankName;
                        var dynamicFields = payment_obj.dynamicFields;
                        quickPayService.pay(businessNo,authNo,password,smsCode,smsMode,verifyRef,
                            remark,cardType,bankCode,sfBankCode,bankName,dynamicFields,tradeScene)
                            .success(function(response, status, headers, config) {
                                $rootScope.loading = false;
                                if (response.rltCode == "00") {
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':$rootScope.amt,'payCode':3
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
                $scope.listCardFunc = function() {
                    var paylistData = {
                        'walletType':3,
                        'toAddBankCode':3,
                        'businessNo':businessNo
                    };
                    StorageDataService.setPaylistParam(paylistData);
                    $state.go('paylist');
                }

                function initBankCard(payment_obj){
                    //----------初始化数据--------------
                    var payType = payment_obj.type;
                    var payTypeName = "";
                    if(payType=="BALANCE"){
                        serviceName = "BALANCE_PAY";
                        payTypeName = "账户余额";
                        //payTypeName = "账户余额(" + FormatNum.fn_money(payment_obj.balance) + "元)";
                    }else if(payType=="POINT"){
                        serviceName = "POINT_PAY";
                        payTypeName = "顺丰金";
                    }else if(payType=="QUICK" || null != payment_obj.cardType){
                        serviceName = "QUICK_PAY";
                        if(payment_obj.cardType=="DEBIT"){
                            payTypeName = payment_obj.bankName + "储蓄卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                        }else{
                            payTypeName = payment_obj.bankName + "信用卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                        }
                    }else if(payType=="FUND"){
                        serviceName = "FUND_PAY";
                        payTypeName = "理财余额";
                    }
                    $scope.iconUrl = payment_obj.iconUrl;
                    $scope.bankName = payTypeName;
                }

                $scope.findPayPwdAccountFunc = function(){
                    StorageDataService.setParam('toGetPwdCode',2);
                    $state.go('findPayPwdAccount');
                }
            }]);


});