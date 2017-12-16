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
        .controller('bankListCtrl', ['queryCardListService','FormatNum', 'StorageDataService', '$rootScope', '$scope', '$state', '$http',
            'queryPayListService', 'queryPaymentListService', 'NirvanaUtil',
            'Toast', 'findAccountLevelAndQuotaService', 'TRADESCENE_RECHARGE',
            'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY','$compile','$document',
            function (queryCardListService,FormatNum, StorageDataService, $rootScope,
                      $scope, $state, $http, queryPayListService,
                      queryPaymentListService, NirvanaUtil, Toast,
                      findAccountLevelAndQuotaService, TRADESCENE_RECHARGE,
                      TRADESCENE_WITHDRAW, TRADESCENE_PAY,$compile,$document) {
                $scope.goBack = function () {
                    $state.go('wallet');
                };
                window.doKeyBack = function () {
                    $scope.goBack();
                };

                //  支付列表title 动态改变
                $scope.paylistTitle = "我的银行卡";

                $scope.showCardFlag = false;

                queryCardList();

                //查询会员绑定银行卡
                function queryCardList() {
                    $rootScope.loading = true;
                    queryCardListService.query()
                        .success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00') {
                                $scope.showCardFlag = true;
                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                $scope.paylist = data.bankList;
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            } else if(response.rltCode == '9504'){
                                _alert('登录已失效，请重新登录');
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
                        } else if(response.rltCode == '9504'){
                            _alert('登录已失效，请重新登录');
                        }else {
                            Toast.show(response.rltMsg);
                        }
                    }).error(function (response) {
                        Toast.show(response.rltMsg);
                        $rootScope.loading = false;
                    });
                }
                $scope.selectFunc = function (index) {
                    // $state.go('walletRecharge');
                    StorageDataService.setParam('cardDetail', $scope.paylist[index]);
                    $state.go('cardDetail');
                };
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



                //添加银行卡
                $scope.addBankCard = function () {
                    StorageDataService.setParam('toAddBankCode', 14);
                    $rootScope.notWithholdSign = 'Y';
                    $state.go('bankcardAdd');//添卡不需要代扣
                }



                /**登录超时弹框处理 */
                var bbBox = null;
                function _alert(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-alertcall msg='+alertMsg+' ok-callback="okFunc()"></bb-alertcall>')($scope);
                    $document.find('body').append(bbBox);
                };

                $scope.okFunc = function(){
                    if(window.noTitle){
                        WeixinJSBridge.call('closeWindow');
                    }else{
                        NirvanaUtil.doBack(0);
                    }
                }
                /**end--------- */

            }])//验证银行卡

});