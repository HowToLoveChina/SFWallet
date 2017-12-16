/**
 * Created by SF on 7/8/16.
 */
define(function (require) {
    var app=require("../app");
    require('../factory/balanceOrPointPayService');
    require('../factory/formatNum');
    require('../factory/createOrderService');
    require('../factory/quickPayService');
    require('../factory/accountLevelService');
    /*
     密码支付弹出框控制器
     */
    app
        .controller('PaymentCtrl', ['balanceOrPointPayService','FormatNum','StorageDataService','createOrderService',
            '$rootScope','$scope','$state','$stateParams','quickPayService','NirvanaUtil','Toast', '$compile','$document','TRADESCENE_PAY',
            function(balanceOrPointPayService,FormatNum,StorageDataService,createOrderService,$rootScope,$scope,$state,$stateParams,quickPayService,NirvanaUtil,Toast,$compile,$document,TRADESCENE_PAY){
                $scope.goBack = function(){
                    NirvanaUtil.doBack(0);
                };
                window.doKeyBack = function(){
                    NirvanaUtil.doBack(0);
                }
                var bbBox = null;
                $scope.showCardFlag = false;
                $scope.okFn = function(){
                    bbBox.remove();
                    $state.go('findPayPwdAccount');
                }
                $scope.getPwdFn = function(){
                    bbBox.remove();
                    $scope.findPayPwdAccountFunc();
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
                $scope.amt = FormatNum.fn_money($rootScope.amt);
                var payment_obj = null;
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
                var businessCode = $rootScope.businessCode;
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
                            var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
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
                                StorageDataService.setParam('toAddBankCode',8);
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
                    // payment_obj.bankSendSMS = 'true';
                    var password = $scope.payPassword;
                    var tradeScene = TRADESCENE_PAY;
                    var remark = "";
                    if('true' == payment_obj.bankSendSMS || dynamicFields != null){
                        var quick_obj = payment_obj;//快捷支付对象
                        $rootScope.params_verifyQuickPay = {
                            payment:payment_obj,
                            payPassword:$scope.payPassword,
                            businessNo:businessNo,
                            payCode:4,
                            amt:amt,
                            tradeScene:tradeScene
                        }
                        $('.pwd-input').blur();
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
                                $('.pwd-input').blur();
                                $rootScope.loading = false;
                                if (response.rltCode == "00") {
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':$rootScope.amt,'payCode':4
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
                                    $('.pwd-input').blur();
                                    var data= NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                    $rootScope.payOkObj = {
                                        'data':data,'amt':$rootScope.amt,'payCode':4
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
                        'walletType':4,
                        'toAddBankCode':4,
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
                        // payTypeName = "账户余额(" + FormatNum.fn_money(payment_obj.balance) + "元)";
                        payTypeName = "账户余额";
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
                    StorageDataService.setParam('toGetPwdCode',3);
                    $state.go('findPayPwdAccount');
                }
            }])//查询支付列表
        .controller('paylistCtrl', ['FormatNum','StorageDataService','$rootScope','$scope','$state','$http', 'queryPayListService','queryPaymentListService','NirvanaUtil','Toast', 'findAccountLevelAndQuotaService', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY', function(FormatNum,StorageDataService,$rootScope,$scope,$state,$http,queryPayListService,queryPaymentListService,NirvanaUtil,Toast, findAccountLevelAndQuotaService, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW, TRADESCENE_PAY){
            $scope.goBack = function(){
                if(walletType == "1"){//充值
                    $state.go('walletRecharge');
                }else if(walletType == "2"){//提现
                    $state.go('walletCash');
                }else if(walletType == "3"){//和缴纳
                    $state.go('depositSure');
                }else{//支付
                    $state.go('pay');
                }
            };
            window.doKeyBack = function(){
                if(walletType == "1"){//充值
                    $state.go('walletRecharge');
                }else if(walletType == "2"){//提现
                    $state.go('walletCash');
                }else if(walletType == "3"){//和缴纳
                    $state.go('depositSure');
                }else{//支付
                    $state.go('pay');
                }
            }
            $scope.showCardFlag = false;
            var paylistData = StorageDataService.getPaylistParam();
            var businessNo = paylistData.businessNo;
            var toAddBankCode = paylistData.toAddBankCode;
            var walletType = paylistData.walletType;
            var tradeScene = TRADESCENE_RECHARGE;//默认充值
            var cashCount = $rootScope.amt;//订单金额
            var pamentObj = StorageDataService.getParam('paymentObj');
            if(walletType == "1"){//paymentObj
                tradeScene = TRADESCENE_RECHARGE;
                queryPayList(tradeScene);
            }else if(walletType == "2"){//提现
                tradeScene = TRADESCENE_WITHDRAW;
                queryPayList(tradeScene);
            }else{//支付和缴纳
                tradeScene = TRADESCENE_PAY;
                queryPaymentList(tradeScene);
            }
            $scope.selectFunc = function(index){
                // $state.go('walletRecharge');
                StorageDataService.setParam('paymentObj',$scope.paylist[index]);
                if(walletType == "1"){//充值
                    $state.go('walletRecharge');
                }else if(walletType == "2"){//提现
                    $state.go('walletCash');
                }else if(walletType == "3"){//和缴纳
                    $state.go('depositSure');
                }else{//支付
                    $state.go('pay');
                }
            }
            //充值和提现
            function queryPayList(tradeScene){
                $rootScope.loading = true;
                queryPayListService.query(tradeScene)
                    .success(function(response){
                        $rootScope.loading = false;
                        if(response.rltCode == '00'){
                            var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            $scope.paylist = data.paymentList;
                            initList();
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            Toast.show(response.rltMsg);
                        }
                    }).error(function(response) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            }
            //缴纳和支付
            function queryPaymentList(tradeScene){
                $rootScope.loading = true;
                queryPaymentListService.query(tradeScene,businessNo)
                    .success(function(response){
                        $rootScope.loading = false;
                        if(response.rltCode == '00'){
                            var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                            $scope.paylist = data.paymentList;
                            initList();
                        }else if(response.rltCode == '14021'){
                            $state.go('accountErr');
                        }else{
                            Toast.show(response.rltMsg);
                        }
                    }).error(function(response) {
                    $rootScope.loading = false;
                    Toast.show(response.rltMsg);
                });
            }

            //查询账户等级及额度
            function findAccountLevelAndQuota(mobile){
                $rootScope.loading = true;
                findAccountLevelAndQuotaService.query(mobile, "").success(function(response, status, headers, config) {
                    $rootScope.loading = false;
                    if (response.rltCode == "00") {
                        var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                        $rootScope.accountLevel = data.accountLevel.toUpperCase();	//账户等级
                        $rootScope.dayCashAmount = data.dayCashAmount;	//日可用限额
                        $rootScope.yearCashAmount = data.yearCashAmount;	//年可用限额
                        $rootScope.availableAmount = data.availableAmount;	//可用限额
                        $rootScope.totalCashAmount = data.totalCashAmount; //一类账户累计使用额度
                    }else{
                        Toast.show(response.rltMsg);
                    }
                }).error(function(response, status, headers, config) {
                    Toast.show(response.rltMsg);
                    $rootScope.loading = false;
                });
            }

            //默认不显示(查看详情)
            $scope.showDetailDiv = false;
            //查看详情
            $scope.viewDetail = function($event){
                $scope.showDetailDiv = true;
                if(!$rootScope.accountLevel){//已经存在就不用再次查询
                    findAccountLevelAndQuota($rootScope.userMobile);
                }
                $event.stopPropagation();
            }
            //知道了
            $scope.Iknow = function(){
                $scope.showDetailDiv = false;
            }

            //初始化列表
            function initList(){
                $scope.showCardFlag = true;
                if($scope.paylist == null){
                    Toast.show("支付列表为空");
                    return;
                }
                if(walletType == "1" || walletType == "2"){
                    for(var i = 0; i < $scope.paylist.length; i ++){
                        if($scope.paylist[i].type == "BALANCE"){
                            $scope.paylist.splice(i,1);
                            break;
                        }
                    }
                }
                for(var i = 0; i < $scope.paylist.length; i ++){
                    $scope.paylist[i].button_clicked = false;
                    if($scope.paylist[i].type == "POINT"){
                        $scope.paylist[i].bankName = "顺丰金";
                    }else if($scope.paylist[i].type == "BALANCE"){
                        var _balanceQuota = $scope.paylist[i].balanceQuota*100;//余额限额
                        var _balance = $scope.paylist[i].balance;//余额
                        if(_balanceQuota > -1*100 && _balanceQuota < _balance){//超限的余额不能提现，点击查看详情
                            $scope.paylist[i].balance = _balanceQuota;
                            $scope.paylist[i].showDetail = true;
                        }
                        $scope.paylist[i].bankName = "账户余额";
                        if($scope.paylist[i].balance < cashCount*1){
                            $scope.paylist[i].button_clicked = true;
                        }
                    }else if($scope.paylist[i].type == "FUND"){
                        $scope.paylist[i].bankName = "理财余额";
                    }
                    if(pamentObj.signNo == null){
                        $scope.paylist[0].isShowSelect = true;
                    }else{
                        if($scope.paylist[i].signNo == pamentObj.signNo){
                            $scope.paylist[i].isShowSelect = true;
                        }else{
                            $scope.paylist[i].isShowSelect = false;
                        }
                    }
                }
            }
            //添加银行卡
            $scope.addBankCard = function(){
                $rootScope.sceneCode = '';
                StorageDataService.setParam('toAddBankCode',toAddBankCode);
                $rootScope.notWithholdSign = 'Y';
                $state.go('bankcardAdd');//从支付列表进入添加银行卡，不需要开通代扣协议
            }

        }])//验证银行卡
        .controller('verifyquickPayCtrl', ['quickPayService','appSyRechargeService','StorageDataService','$rootScope','$scope','$state','$http', 'sendPaySmsService','NirvanaUtil','Toast', '$compile','$document',
            function(quickPayService,appSyRechargeService,StorageDataService,$rootScope,$scope,$state,$http,sendPaySmsService,NirvanaUtil,Toast, $compile,$document){
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