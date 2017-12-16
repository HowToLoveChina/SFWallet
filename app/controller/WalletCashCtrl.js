/**
 * Created by SF on 7/8/16.
 */
//define(['require','app'],function (require,app) {
define(function (require) {
    var app = require('../app');
    require('../factory/queryPayListService');
    require('directiveFreq');
    require('../factory/accountLevelService');
    require('filter');
    app
        .controller('WalletCashCtrl', ['queryPayListService', 'StorageDataService', '$rootScope', '$scope', '$state', '$http', 'NirvanaUtil', 'Toast', 'findAccountLevelAndQuotaService', 'TRADESCENE_WITHDRAW', function (queryPayListService, StorageDataService, $rootScope, $scope, $state, $http, NirvanaUtil, Toast, findAccountLevelAndQuotaService, TRADESCENE_WITHDRAW) {
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
            var payment_obj = null;
            var tradeScene = TRADESCENE_WITHDRAW;

            if (StorageDataService.getParam('inputCash') != null) {
                $scope.cashCountInput = StorageDataService.getParam('inputCash');
            }
            if (StorageDataService.getParam('paymentObj') == null) {
                queryPayList(tradeScene);
            } else {
                $scope.showCardFlag = true;
                payment_obj = StorageDataService.getParam('paymentObj')
                if (null == payment_obj.availableQuota) {
                    queryPayList(tradeScene);
                } else {
                    initBankCard(payment_obj);
                }
            }
            /**
             * 点击全部提现
             */
            $scope.allCashFunc = function(){
                $scope.cashCountInput = $rootScope.usableCount.replace(new RegExp(',','gm'),'');
            }
            //判断余额限额
            function judgeBalanceQuota(balanceQuota) {
                if (balanceQuota * 1 < $rootScope.usableCount * 1) {//超限的余额不能提现，点击查看详情
                    $rootScope.usableCount = balanceQuota;
                    $scope.showDetail = true;
                }
            }

            //查询账户等级、可用限额
            function findAccountLevelAndQuota(mobile) {
                //$rootScope.loading = true;
                findAccountLevelAndQuotaService.query(mobile, "withdraw").success(function (response, status, headers, config) {
                    //$rootScope.loading = false;
                    if (response.rltCode == "00") {
                        var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                        $rootScope.accountLevel = data.accountLevel ? data.accountLevel.toUpperCase() : '';	//账户等级
                        $rootScope.dayCashAmount = data.dayCashAmount;	//日可用限额
                        $rootScope.yearCashAmount = data.yearCashAmount;	//年可用限额
                        $rootScope.availableAmount = data.availableAmount;	//可用限额
                        $rootScope.totalCashAmount = data.totalCashAmount; //一类账户累计使用额度
                        if ($rootScope.availableAmount > -1) {
                            judgeBalanceQuota($rootScope.availableAmount);
                        }
                    } else {
                        Toast.show(response.rltMsg);
                    }
                }).error(function (response, status, headers, config) {
                    Toast.show(response.rltMsg);
                    $rootScope.loading = false;
                });
            }

            findAccountLevelAndQuota($rootScope.userMobile);
            //默认不显示
            $scope.showDetailDiv = false;
            //查看详情
            $scope.viewDetail = function () {
                $scope.showDetailDiv = true;
            }
            $scope.closeDetail = function () {
                $scope.showDetailDiv = false;
            }
            //立即提升，即从余额提现进入添加银行卡
            $scope.addBankCard = function () {
                $scope.closeDetail();
                $rootScope.sceneCode = '040000001';
                StorageDataService.setParam('toAddBankCode', 2);
                $rootScope.notWithholdSign = 'Y';
                $state.go('bankcardAdd');//添卡时不开通代扣
            }
            //点击提现
            $scope.walletCashFunc = function () {
                if (null == payment_obj) {
                    Toast.show('请选择一张银行卡');
                    return;
                }
                if ($scope.cashCountInput * 1 > $rootScope.usableCount * 1) {
                    Toast.show('提现金额超限');
                    return;
                }
                var inputpwdData = {
                    'paymentObj': payment_obj,
                    'walletType': 2,
                    'amt': $scope.cashCountInput
                };
                StorageDataService.setInputPwdParam(inputpwdData);
                StorageDataService.setParam('inputCash', $scope.cashCountInput);
                $state.go('inputpwd');
            }
            $scope.listCardFunc = function () {
                var paylistData = {
                    'walletType': 2,
                    'toAddBankCode': 2,
                    'businessNo': null
                };
                StorageDataService.setPaylistParam(paylistData);
                StorageDataService.setParam('inputCash', $scope.cashCountInput);
                $state.go('paylist');
            }

            function queryPayList(tradeScene) {
                $rootScope.loading = true;
                queryPayListService.query(tradeScene)
                    .success(function (response) {
                        $rootScope.loading = false;
                        if (response.rltCode == '00') {
                            var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            // payment_obj = data.paymentList[0];
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
                //----------初始化数据--------------
                if (null == payment_obj) {
                    return;
                }
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
                    // if (payment_obj.cardType == "DEBIT") {
                    //     payTypeName = payment_obj.bankName + "储蓄卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                    // } else {
                    //     payTypeName = payment_obj.bankName + "信用卡（" + NirvanaUtil.subBank(payment_obj.cardNo) + "）";
                    // }

                    if(payment_obj.cardType=="DEBIT"){
                        payTypeName = payment_obj.bankName + "储蓄卡";
                    }else{
                        payTypeName = payment_obj.bankName + "信用卡";
                    }

                    $scope.cardNoSub= NirvanaUtil.subBank(payment_obj.cardNo);

                } else if (payType == "FUND") {
                    serviceName = "FUND_PAY";
                    payTypeName = "理财余额";
                }
                $scope.iconUrl = payment_obj.iconUrl;
                $scope.bankName = payment_obj.bankName;
                $scope.remark = payment_obj.withDrawTips
            }

            bindKeyEvent($("#inputCash"));
            function bindKeyEvent(obj){
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
                    if (/\.$/.test(v))
                    {
                        $(this).val(v.substr(0, v.length - 1));
                    }
                });
            }
        }])


});
