/**
 * Created by SF on 7/11/16.
 */

define(function (require) {
    var app = require("../app");
    require("../factory/formatNum");
    app
        .controller('payOkCtrl', ['FormatNum', '$rootScope', '$scope', '$state', '$http', 'NirvanaUtil', function (FormatNum, $rootScope, $scope, $state, $http, NirvanaUtil) {
            $rootScope.paySucess = true;//标示已经成功
            $scope.goBack = function () {
                $scope.payFinishFunc();
            };
            window.doKeyBack = function () {
                $scope.goBack();
            }

            try {
                SFPayHybrid.backKeyboard("0");//关闭ios版本速运app键盘
            } catch (e) {
            }
            $scope.div01show = true;
            $scope.div02show = true;
            $scope.div03show = true;
            $scope.div04show = true;
            var payCode = $rootScope.payOkObj.payCode;
            var data = $rootScope.payOkObj.data;
            $scope.amt = FormatNum.fn_money($rootScope.payOkObj.amt);
            if (1 == payCode) {//充值
                $scope.payName = '充值成功';
                $scope.div01show = true;
                $scope.div02show = false;
                $scope.div03show = false;
                $scope.div04show = false;
                $scope.div01_payment = data.payment;
            } else if (2 == payCode) {//提现
                $scope.payName = '提现申请已提交';
                $scope.div01show = false;
                $scope.div02show = true;
                $scope.div03show = true;
                $scope.div04show = false;
                $scope.div02_payment = data.payment;
                $scope.div03_payment = data.withDrawTips;
            } else if (3 == payCode) {//缴纳
                $scope.payName = '缴纳成功';
                if ($rootScope.app == 'o2oRN') {//添加用来识别是否是新版本RN开发模式
                    try {
                        WebViewBridge.send("payDepositSuccess");
                    } catch (e) {
                    }
                } else {
                    try {
                        FinishInterface.doBackgroudBusiness(3);
                    } catch (e) {
                    }
                }
                $scope.div01show = true;
                $scope.div02show = false;
                $scope.div03show = false;
                $scope.div04show = false;
                $scope.div01_payment = data.payment;
            } else if (4 == payCode) {//付款
                $scope.payName = '支付成功';
                if ($rootScope.app == 'o2oRN') {//添加用来识别是否是新版本RN开发模式
                    try {
                        WebViewBridge.send("paySuccess");
                    } catch (e) {
                    }
                } else {
                    try {
                        FinishInterface.doBackgroudBusiness(2);
                    } catch (e) {
                    }
                }
                $scope.div01show = true;
                $scope.div02show = false;
                $scope.div03show = false;
                $scope.div04show = true;
                $scope.div01_payment = data.payment;
                $scope.div04_payment = data.oppositeName;
            }

            $scope.walletRechargeFunc = function () {
                // body...
                $state.go('walletRecharge');
            }

            $scope.walletCashFunc = function () {
                // body...
                $state.go('walletCash');
            }

            $scope.payFinishFunc = function () {
                $rootScope.paySucess = false;
                if (1 == payCode || 2 == payCode) {
                    $state.go('wallet');
                } else {
                    NirvanaUtil.doBack(1);
                }
            }


        }])


});