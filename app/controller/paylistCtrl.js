/**
 * Created by SF on 7/11/16.
 */
define(function (require) {
    var app = require('../app');
              require('../factory/formatNum');
              require('../factory/queryPayListService');
              require('../factory/queryPaymentListService');
              require('filter');
              require('../factory/accountLevelService');

    app
        .controller('paylistCtrl', ['FormatNum', 'StorageDataService', '$rootScope', '$scope', '$state', '$stateParams', '$http',
            'queryPayListService', 'queryPaymentListService', 'NirvanaUtil', 'Toast', 'findAccountLevelAndQuotaService', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY', function (FormatNum, StorageDataService, $rootScope, $scope, $state, $stateParams, $http, queryPayListService, queryPaymentListService, NirvanaUtil, Toast, findAccountLevelAndQuotaService, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW, TRADESCENE_PAY) {
                $scope.goBack = function () {
                    if (walletType == "1") {//充值
                        $state.go('walletRecharge');
                    } else if (walletType == "2") {//提现
                        $state.go('walletCash');
                    } else if (walletType == "3") {//和缴纳
                        $state.go('depositSure');
                    } else {//支付
                        $state.go('pay');
                    }
                };
                window.doKeyBack = function () {
                    if (walletType == "1") {//充值
                        $state.go('walletRecharge');
                    } else if (walletType == "2") {//提现
                        $state.go('walletCash');
                    } else if (walletType == "3") {//和缴纳
                        $state.go('depositSure');
                    } else {//支付
                        $state.go('pay');
                    }
                }

                //  支付列表title 动态改变
                $scope.paylistTitle = "选择付款方式";
                $scope.balanceShowFlag = true;

                $scope.showCardFlag = false;
                var paylistData = StorageDataService.getPaylistParam();
                var businessNo = paylistData.businessNo;
                var toAddBankCode = paylistData.toAddBankCode;
                var walletType = paylistData.walletType;
                var tradeScene = TRADESCENE_RECHARGE;//默认充值
                var cashCount = $rootScope.amt;//订单金额
                var pamentObj = StorageDataService.getParam('paymentObj');
                if (walletType == "1") {//paymentObj
                    tradeScene = TRADESCENE_RECHARGE;
                    queryPayList(tradeScene);
                } else if (walletType == "2") {//提现
                    $scope.paylistTitle = "选择银行卡";//  支付列表title 动态改变
                    $scope.balanceShowFlag = true;//控制显示余额的标示
                    tradeScene = TRADESCENE_WITHDRAW;
                    queryPayList(tradeScene);
                } else {//支付和缴纳
                    tradeScene = TRADESCENE_PAY;
                    queryPaymentList(tradeScene);
                }
                $scope.selectFunc = function (index) {
                    // $state.go('walletRecharge');
                    StorageDataService.setParam('paymentObj', $scope.paylist[index]);
                    if (walletType == "1") {//充值
                        $state.go('walletRecharge');
                    } else if (walletType == "2") {//提现
                        $state.go('walletCash');
                    } else if (walletType == "3") {//和缴纳
                        $state.go('depositSure');
                    } else {//支付
                        $state.go('pay');
                    }
                }
                //充值和提现
                function queryPayList(tradeScene) {
                    $rootScope.loading = true;
                    queryPayListService.query(tradeScene)
                        .success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00') {
                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                $scope.paylist = data.paymentList;
                                initList();
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

                //缴纳和支付
                function queryPaymentList(tradeScene) {
                    $rootScope.loading = true;
                    queryPaymentListService.query(tradeScene, businessNo)
                        .success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00') {
                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                $scope.paylist = data.paymentList;
                                initList();
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

                //查询账户等级及额度
                function findAccountLevelAndQuota(mobile) {
                    $rootScope.loading = true;
                    findAccountLevelAndQuotaService.query(mobile, "").success(function (response, status, headers, config) {
                        $rootScope.loading = false;
                        if (response.rltCode == "00") {
                            var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            $rootScope.accountLevel = data.accountLevel ? data.accountLevel.toUpperCase() : '';	//账户等级
                            $rootScope.dayCashAmount = data.dayCashAmount;	//日可用限额
                            $rootScope.yearCashAmount = data.yearCashAmount;	//年可用限额
                            $rootScope.availableAmount = data.availableAmount;	//可用限额
                            $rootScope.totalCashAmount = data.totalCashAmount; //一类账户累计使用额度
                        } else {
                            Toast.show(response.rltMsg);
                        }
                    }).error(function (response, status, headers, config) {
                        Toast.show(response.rltMsg);
                        $rootScope.loading = false;
                    });
                }

                //默认不显示(查看详情)
                $scope.showDetailDiv = false;
                //查看详情
                $scope.viewDetail = function ($event) {
                    $scope.showDetailDiv = true;
                    if (!$rootScope.accountLevel) {//已经存在就不用再次查询
                        findAccountLevelAndQuota($rootScope.userMobile);
                    }
                    $event.stopPropagation();
                }
                //知道了
                $scope.Iknow = function () {
                    $scope.showDetailDiv = false;
                }

                //初始化列表
                function initList() {
                    $scope.showCardFlag = true;
                    if ($scope.paylist == null) {
                        Toast.show("支付列表为空");
                        return;
                    }
                    if (walletType == "1" || walletType == "2") {
                        for (var i = 0; i < $scope.paylist.length; i++) {
                            if ($scope.paylist[i].type == "BALANCE") {
                                $scope.paylist.splice(i, 1);
                                break;
                            }
                        }
                    }
                    for (var i = 0; i < $scope.paylist.length; i++) {
                        $scope.paylist[i].button_clicked = false;
                        if ($scope.paylist[i].type == "POINT") {
                            $scope.paylist[i].bankName = "顺丰金";
                        } else if ($scope.paylist[i].type == "BALANCE") {
                            var _balanceQuota = $scope.paylist[i].balanceQuota * 100;//余额限额
                            var _balance = $scope.paylist[i].balance;//余额
                            if (_balanceQuota > -1 * 100 && _balanceQuota < _balance) {//超限的余额不能提现，点击查看详情
                                $scope.paylist[i].balance = _balanceQuota;
                                $scope.paylist[i].showDetail = true;
                            }
                            $scope.paylist[i].bankName = "账户余额";
                            if ($scope.paylist[i].balance < cashCount * 1) {
                                $scope.paylist[i].button_clicked = true;
                            }
                        } else if ($scope.paylist[i].type == "FUND") {
                            $scope.paylist[i].bankName = "理财余额";
                        }else if ($scope.paylist[i].type == "QUICK") {
                            //=-1表示无额度上限，即可以支付
                            if($scope.paylist[i].availableQuota != -1 && $scope.paylist[i].availableQuota * 100 < cashCount * 1){
                                $scope.paylist[i].button_clicked = true;
                            }
                        }
                        if (pamentObj.signNo == null) {
                            $scope.paylist[0].isShowSelect = true;
                        } else {
                            if ($scope.paylist[i].signNo == pamentObj.signNo) {
                                $scope.paylist[i].isShowSelect = true;
                            } else {
                                $scope.paylist[i].isShowSelect = false;
                            }
                        }
                    }
                }

                //添加银行卡
                $scope.addBankCard = function () {
                    $rootScope.sceneCode = '';
                    StorageDataService.setParam('toAddBankCode', toAddBankCode);
                    $rootScope.notWithholdSign = 'Y';
                    $state.go('bankcardAdd');//从支付列表进入添加银行卡，不需要开通代扣协议
                }

            }])//验证银行卡

});