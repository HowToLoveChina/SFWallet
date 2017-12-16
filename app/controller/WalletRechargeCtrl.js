/**
 * Created by SF on 7/11/16.
 */
//define(['require', 'app'], function (require, app) {
define(function (require) {
     var app = require('../app');
     require('../factory/formatNum');
     require('../factory/queryPayListService');
    app
        .controller('WalletRechargeCtrl', ['FormatNum', 'queryPayListService', 'StorageDataService', '$rootScope',
            '$scope', '$state', '$http', 'NirvanaUtil', 'Toast', 'TRADESCENE_RECHARGE', function (FormatNum, queryPayListService, StorageDataService, $rootScope, $scope, $state, $http, NirvanaUtil, Toast, TRADESCENE_RECHARGE) {
                $scope.goBack = function () {
                    // window.history.back();
                    StorageDataService.setParam('paymentObj', null);
                    $state.go('wallet');
                };
                window.doKeyBack = function () {
                    StorageDataService.setParam('paymentObj', null);
                    $state.go('wallet');
                }
                $scope.showCardFlag = false;
                var payment_obj = StorageDataService.getParam('paymentObj');
                var data = null;
                var tradeScene = TRADESCENE_RECHARGE;
                if (payment_obj == null) {
                    queryPayList(tradeScene);
                } else {
                    $scope.showCardFlag = true;
                    if (null == payment_obj.availableQuota) {
                        queryPayList(tradeScene);
                    } else {
                        initBankCard(payment_obj);
                    }
                }
                if (StorageDataService.getParam('inputCash') != null) {
                    $scope.rechargeCount = StorageDataService.getParam('inputCash');
                }


                $scope.rechargeFunc = function () {
                    if (null == payment_obj) {
                        Toast.show('请选择一张银行卡');
                        return;
                    }
                    if (payment_obj.availableQuota != -1 && $scope.rechargeCount * 1 > payment_obj.availableQuota * 1) {
                        Toast.show('充值金额超限');
                        return;
                    }
                    var inputpwdData = {
                        'paymentObj': payment_obj,
                        'walletType': 1,
                        'amt': $scope.rechargeCount
                    };
                    StorageDataService.setInputPwdParam(inputpwdData);
                    StorageDataService.setParam('inputCash', $scope.rechargeCount);
                    $state.go('inputpwd');
                    // $state.go('inputpwd',{"walletType":1,'cashCount':$scope.rechargeCount,'paymentObj':payment_obj});
                }

                $scope.listCardFunc = function () {
                    var paylistData = {
                        'walletType': 1,
                        'toAddBankCode': 1,
                        'businessNo': null
                    };
                    StorageDataService.setPaylistParam(paylistData);
                    StorageDataService.setParam('inputCash', $scope.rechargeCount);
                    $state.go('paylist');
                }

                $scope.canRechargeCash = StorageDataService.getParam('canRechargeCash');

                function queryPayList(tradeScene) {
                    $rootScope.loading = true;
                    queryPayListService.query(tradeScene)
                        .success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00') {
                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                if (null != data.paymentList) {
                                    if (null != payment_obj && null == payment_obj.availableQuota) {
                                        for (var i = 0; i < data.paymentList.length; i++) {
                                            if (data.paymentList[i].signNo == payment_obj.signNo) {
                                                payment_obj = data.paymentList[i];
                                                break;
                                            }
                                        }
                                    } else {
                                        for (var i = 0; i < data.paymentList.length; i++) {
                                            if (data.paymentList[i].type == "QUICK") {
                                                payment_obj = data.paymentList[i];
                                                break;
                                            }
                                        }
                                    }
                                    StorageDataService.setParam('paymentObj', payment_obj);
                                    initBankCard(payment_obj);
                                }
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            } else {
                                Toast.show(response.rltMsg);
                            }
                        }).error(function (response) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                        });
                }

                function initBankCard(payment_obj) {
                    $scope.showCardFlag = true;
                    if (null == payment_obj) {
                        return;
                    }
                    //----------初始化数据--------------
                    var payType = payment_obj.type;
                    var payTypeName = "";
                    if (payType == "BALANCE") {
                        serviceName = "BALANCE_PAY";
                        payTypeName = "账户余额";
                    } else if (payType == "POINT") {
                        serviceName = "POINT_PAY";
                        payTypeName = "顺丰金";
                    } else if (payType == "QUICK") {
                        serviceName = "QUICK_PAY";
                        authNo = payment_obj.signNo;
                        bankSendSMS = payment_obj.bankSendSMS;//是否银行发送短信
                        dynamicFields = payment_obj.dynamicFields;//支付时动态字段 安全码和有效期
                        // if(payment_obj.cardType=="DEBIT"){
                        //     payTypeName = payment_obj.bankName + "储蓄卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                        // }else{
                        //     payTypeName = payment_obj.bankName + "信用卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                        // }
                        if (payment_obj.cardType == "DEBIT") {
                            payTypeName = payment_obj.bankName + "储蓄卡";
                        } else {
                            payTypeName = payment_obj.bankName + "信用卡";
                        }

                        $scope.cardNoSub = NirvanaUtil.subBank(payment_obj.cardNo);
                        // console.log($scope.cardNoSub)

                    } else if (payType == "FUND") {
                        serviceName = "FUND_PAY";
                        payTypeName = "理财余额";
                    }
                    $scope.iconUrl = payment_obj.iconUrl;
                    $scope.bankName = payment_obj.bankName;
                    if (payment_obj.availableQuota != -1) {//限额
                        $scope.showCardRamark = true;
                        $scope.canRechargeCash = payment_obj.availableQuota;
                        StorageDataService.setParam('canRechargeCash', payment_obj.availableQuota);
                        $scope.remark = '本次可充值' + FormatNum.formate(payment_obj.availableQuota) + '元';
                    } else {//不限额
                        $scope.showCardRamark = false;
                    }

                    // $scope.remark = '单笔' + payment_obj.oneQuota + '元 ' + '单日' + payment_obj.dayQuota + '元 ' + '单月' + payment_obj.monthQuota + '元'
                }

                bindKeyEvent($("#inputRecharge"));
                function bindKeyEvent(obj) {
                    obj.keyup(function () {
                        var reg = $(this).val().match(/\d+\.?\d{0,2}/);
                        var txt = '';
                        if (reg != null) {
                            txt = reg[0];
                        }
                        $(this).val(txt);
                    }).change(function () {
                        $(this).keypress();
                        var v = $(this).val();
                        if (/\.$/.test(v)) {
                            $(this).val(v.substr(0, v.length - 1));
                        }
                    });
                }
            }])//提现


});