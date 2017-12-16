//  author:zhoulujun  createDate:2016-06-25   
//  路由配置
define(['require', 'app', 'directiveFreq', 'factoryFreq', 'run'], function (require, app) {
    app
        .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {

            /* 我的拦截器 */
            $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            $httpProvider.defaults.transformRequest = function (obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            };
            $urlRouterProvider.otherwise('/404');
            $urlRouterProvider.when('','/');

            $stateProvider
                .state('app', {
                    url: '/',
                    templateUrl: 'view/load.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'LoadCtrl'
                })
                .state('404', {
                    url: '/404',
                    templateUrl: 'view/404.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'ErrCtrl'
                })
                .state('load', {
                    url: '/load',
                    templateUrl: 'view/load.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'LoadCtrl'
                })
                //账户异常页面
                .state('accountErr', {
                    url: '/accountErr',
                    templateUrl: 'view/accountErr.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'accountErrCtrl'
                })
                /* 异常界面 **/
                .state('exceptionPage', {
                    url: '/exceptionPage',
                    templateUrl: 'view/exception.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'exceptionCtrl'
                })


                /* 钱包 */
                .state('wallet', {
                    url: '/wallet',
                    templateUrl: 'view/wallet.html',
                    controllerUrl: 'controller/WalletCtrl',
                    controller: 'WalletCtrl'
                    //dependencies: ['factory/walletHttp','factory/createOrderService','factory/formatNum']

                })
                /* 充值 */
                .state('walletRecharge', {
                    url: '/walletRecharge',
                    templateUrl: 'view/walletRecharge.html',
                    controllerUrl: 'controller/WalletRechargeCtrl',
                    controller: 'WalletRechargeCtrl'
                    //dependencies: ['factory/formatNum', 'factory/queryPayListService']
                })
                /* 提现 */
                .state('walletCash', {
                    url: '/walletCash',
                    templateUrl: 'view/walletCash.html',
                    controllerUrl: 'controller/WalletCashCtrl',
                    controller: 'WalletCashCtrl'
                    //dependencies: ['factory/queryPayListService','factory/accountLevelService','directive/directiveFreq','filter']
                })

                //交易记录
                .state('tradeList', {
                    url: '/tradeList',
                    templateUrl: 'view/tradeList.html',
                    controllerUrl: 'controller/tradeCtrl',
                    controller: 'tradeListCtrl'
                })
                //交易详情
                .state('tradeDetail', {
                    url: '/tradeDetail',
                    templateUrl: 'view/tradeDetail.html',
                    controllerUrl: 'controller/tradeCtrl',
                    controller: 'tradeDetailCtrl'
                })
                //银行卡
                .state('bankList', {
                    url: '/bankList',
                    templateUrl: 'view/bankList.html',
                    controllerUrl: 'controller/bankListCtrl',
                    controller: 'bankListCtrl'
                    // dependencies: ['factory/walletHttp']

                })
                //银行卡详情
                .state('cardDetail', {
                    url: '/cardDetail',
                    templateUrl: 'view/cardDetail.html',
                    controllerUrl: 'controller/cardDetailCtrl',
                    controller: 'cardDetailCtrl',
                    dependencies: ['filter']

                })



                /* 支付列表 */
                .state('paylist', {
                    url: '/paylist',
                    templateUrl: 'view/paylist.html',
                    controllerUrl: 'controller/paylistCtrl',
                    controller: 'paylistCtrl'
                })
                /* 输入支付密码 */
                .state('inputpwd', {
                    url: '/inputpwd',
                    templateUrl: 'view/inputpwd.html',
                    controllerUrl: 'controller/inputpwdCtrl',
                    controller: 'inputpwdCtrl'
                })
                /* 支付密码框 */
                .state('pay', {
                    url: '/pay',
                    templateUrl: 'view/payment.html',
                    controllerUrl: 'controller/PaymentCtrl',
                    controller: 'PaymentCtrl'
                })
                /* 验证银行卡 */
                .state('verifyQuickPay', {
                    url: '/verifyQuickPay',
                    templateUrl: 'view/verifyQuickPay.html',
                    controllerUrl: 'controller/verifyquickPayCtrl',
                    controller: 'verifyquickPayCtrl'
                })

                /* 提现成功 */
                .state('payOk', {
                    url: '/payOk',
                    templateUrl: 'view/payOk.html',
                    controllerUrl: 'controller/payOkCtrl',
                    controller: 'payOkCtrl'
                })


                /* 提取/缴纳保证金确认 */
                .state('depositSure', {
                    url: '/depositSure',
                    templateUrl: 'view/depositSure.html',
                    controllerUrl: 'controller/DepositSureCtrl',
                    controller: 'DepositSureCtrl'
                })

                /*   修改支付密码   */
                /*  修改支付密码账号信息  */
                .state('modifyPayPwdAccount', {
                    url: '/modifyPayPwdAccount',
                    templateUrl: 'view/modifyPayPwdAccount.html',
                    controllerUrl: 'controller/modifyPayPwdAccountCtrl',
                    controller: 'modifyPayPwdAccountCtrl'
                })
                /* 修改支付密码验证短信验证码 */
                .state('modifyPayPwdSMS', {
                    url: '/modifyPayPwdSMS',
                    templateUrl: 'view/modifyPayPwdSMS.html',
                    controllerUrl: 'controller/modifyPayPwdSMSCtrl',
                    controller: 'modifyPayPwdSMSCtrl'
                })
                /*  输入原支付密码  */
                .state('inputOldPayPwd', {
                    url: '/inputOldPayPwd',
                    templateUrl: 'view/inputOldPayPwd.html',
                    controllerUrl: 'controller/inputOldPayPwdCtrl',
                    controller: 'inputOldPayPwdCtrl'
                })
                /* 设置新的支付密码页面 */
                .state('inputNewPayPwd', {
                    url: '/inputNewPayPwd',
                    templateUrl: 'view/inputNewPayPwd.html',
                    controllerUrl: 'controller/inputNewPayPwdCtrl',
                    controller: 'inputNewPayPwdCtrl'
                })
                /* 重新输入新的支付密码页面 */
                .state('inputRePayPwd', {
                    url: '/inputRePayPwd',
                    templateUrl: 'view/inputRePayPwd.html',
                    controllerUrl: 'controller/inputNewPayPwdCtrl',
                    controller: 'inputRePayPwdCtrl'
                })

                /* 添加新银行卡 */
                .state('bankcardAdd', {
                    url: '/bankcardAdd',
                    templateUrl: 'view/bankAdd.html',
                    controllerUrl: 'controller/BankCardAddCtrl',
                    controller: 'BankCardAddCtrl',
                    resolve: {
                        // We specify a promise to be resolved
                        queryWithholdType: function (WithholdType, StorageDataService) {
                            var code = StorageDataService.getParam('toAddBankCode');
                            if (code == 1 || code == 2 || code == 3 || code == 4) {
                                return {data: {rltCode: -1, rltMsg: ''}};
                            } else {
                                return WithholdType.query();
                            }
                        },
                        certTypeListQuery: function (queryIsRealNameAndSupportCertsService) {
                            return queryIsRealNameAndSupportCertsService.query();
                        }
                    }
                })
                /* 填写银行卡信息 */
                .state('bankcardInfo', {
                    url: '/bankcardInfo',
                    templateUrl: 'view/bankInfo1.html',
                    controllerUrl: 'controller/bankCardCtrl',
                    controller: 'BankCardInfoCtrl'
                })
                /* 填写银行卡信息2 */
                .state('bankcardInfo2', {
                    url: '/bankcardInfo2',
                    templateUrl: 'view/bankInfo2.html',
                    controllerUrl: 'controller/bankCardCtrl',
                    controller: 'BankCardInfoCtrl2'
                })
                /* 填写银行卡手机号(某些情况下是去招行页面) */
                .state('bankcardInfo3', {
                    url: '/bankcardInfo3',
                    templateUrl: 'view/bankInfo3.html',
                    controllerUrl: 'controller/bankCardCtrl',
                    controller: 'BankCardInfoCtrl3'
                })
                /* 验证上一步的手机号 */
                .state('bankcardVerify', {
                    url: '/bankcardVerify',
                    templateUrl: 'view/bankVerify.html',
                    controllerUrl: 'controller/bankCardCtrl',
                    controller: 'BankCardValidPhoneCtrl'
                })

                /* 代扣-开通代扣服务信息填写 */
                .state('withholding', {
                    url: '/withholding',
                    templateUrl: 'view/withholdAdd.html',
                    controllerUrl: 'controller/withholdCtrl',
                    controller: 'WithHoldingCtrl',
                    resolve: {
                        queryWithholdType: function (WithholdType) {
                            return WithholdType.query();
                        }
                    }
                })
                /* 代扣-更换代扣银行卡 */
                .state('withholdingSwitch', {
                    url: '/withholdingSwitch',
                    templateUrl: 'view/withholdChange.html',
                    controllerUrl: 'controller/withholdCtrl',
                    controller: 'WithHoldingChangeCtrl',
                    resolve: {
                        withholdDetail: function ($rootScope, WithholdSignDetail) {
                            return WithholdSignDetail.query($rootScope.contractNo);
                        }
                    }
                })
                /* 代扣-验证支付密码 */
                .state('withholdInputPayPwd', {
                    url: '/withholdInputPayPwd',
                    controllerUrl: 'controller/withholdCtrl',
                    templateUrl: 'view/inputPayPwd.html',
                    controller: 'withholdInputPayPwdCtrl'
                })

                /* 绑定顺手付帐号 */
                .state('bind', {
                    url: '/bind/:id',
                    templateUrl: 'view/bind.html',
                    controllerUrl: 'controller/BindCtrl',
                    controller: 'BindCtrl'
                })
                /* 设置支付密码第一次输入（为注册手机时） */
                .state('bindSetPayPwd', {
                    url: '/bindSetPayPwd',
                    templateUrl: 'view/setNewPayPwd.html',
                    controllerUrl: 'controller/BindCtrl',
                    controller: 'setPayPwdCtrl'
                })
                /* 设置支付密码第二次输入（为注册手机时） */
                .state('setRePayPwd', {
                    url: '/bindSetPayPwd',
                    templateUrl: 'view/setRePayPwd.html',
                    controllerUrl: 'controller/BindCtrl',
                    controller: 'setRePayPwdCtrl'
                })
             /* 输入短信验证码 */
                .state('bindVerify', {
                    url: '/bindVerify',
                    templateUrl: 'view/verify.html',
                    controllerUrl: 'controller/BindCtrl',
                    controller: 'bindVerifyCtrl'
                })
                /* 绑定成功 */
                .state('bindSuccess', {
                    url: '/bindSuccess',
                    templateUrl: 'view/success.html',
                    controller: 'BindSuccessCtrl'
                })
                /**
             *  找回支付密码
             */
                /* 找回支付密码账号信息 */
                .state('findPayPwdAccount', {
                    url: '/findPayPwdAccount',
                    templateUrl: 'view/findPayPwdAccount.html',
                    controllerUrl: 'controller/findPayPwdAccountCtrl',
                    controller: 'findPayPwdAccountCtrl'
                })
                /* 找回支付密码验证短信验证码 */
                .state('findPayPwdSMS', {
                    url: '/findPayPwdSMS',
                    templateUrl: 'view/findPayPwdSMS.html',
                    controllerUrl: 'controller/findPayPwd',
                    controller: 'findPayPwdSMSCtrl'
                })
                /* 找回支付密码验证身份信息 */
                .state('findPayPwdUserInfo', {
                    url: '/findPayPwdUserInfo',
                    templateUrl: 'view/findPayPwdUserInfo.html',
                    controllerUrl: 'controller/findPayPwd',
                    controller: 'findPayPwdUserInfoCtrl'
                })

                /* 协议 */
                .state('sfpayProtocal', {
                    url: '/sfpayProtocal',
                    templateUrl: 'view/protocalSFpay.html',
                    controllerUrl: 'controller/protocalCtrls',
                    controller: 'protocalCtrl'
                })
                //快捷支付协议
                .state('quickPayProtocal', {
                    url: '/quickPayProtocal',
                    templateUrl: 'view/protocalQuickPay.html',
                    controllerUrl: 'controller/protocalCtrls',
                    controller: 'protocalCtrl'
                })
                //银行协议
                .state('bankProtocal', {
                    url: '/bankProtocal',
                    templateUrl: 'view/protocalBank.html',
                    controllerUrl: 'controller/protocalCtrls',
                    controller: 'bankProtocalCtrl'
                })
                .state('withholdProtocal', {
                    url: '/withholdProtocal',
                    templateUrl: 'view/protocalWithhold.html',
                    controllerUrl: 'controller/protocalCtrls',
                    controller: 'protocalCtrl'
                })
                //支付安全主页
                .state('securityHome', {
                    url: '/securityHome',
                    templateUrl: 'view/securityHome.html',
                    controllerUrl: 'controller/securityHomeCtrl',
                    controller: 'securityHomeCtrl'
                })
                //更换绑定手机号入口
                .state('account', {
                    url: '/account',
                    templateUrl: 'view/sfAccount.html',
                    controllerUrl: 'controller/sfAccountCtrl',
                    controller: 'sfAccountCtrl'
                })
                //验证支付密码
                .state('validPayPwd', {
                    url: '/validPayPwd',
                    templateUrl: 'view/validPayPwd.html',
                    controllerUrl: 'controller/validPayPwdCtrl',
                    controller: 'validPayPwdCtrl'
                })
                //更换手机号
                .state('updateMobile', {
                    url: '/updateMobile',
                    templateUrl: 'view/updateMobile.html',
                    controllerUrl: 'controller/updateMobileCtrl',
                    controller: 'updateMobileCtrl'
                })
                //更换手机号验证收到的短信
                .state('updateMobileSms', {
                    url: '/updateMobileSms',
                    templateUrl: 'view/updateMobileSms.html',
                    controllerUrl: 'controller/updateMobileSms',
                    controller: 'updateMobileSmsCtrl'
                })
                //实名认证详情
                .state('authDetail', {
                    url: '/authDetail',
                    templateUrl: 'view/authDetail.html',
                    controllerUrl: 'controller/authDetailCtrl',
                    controller: 'authDetailCtrl'
                })
                //设置银行卡预留手机号
                .state('setMobile', {
                    url: '/setMobile',
                    templateUrl: 'view/setMobile.html',
                    controllerUrl: 'controller/setMobileCtrl',
                    controller: 'setMobileCtrl'
                })
                /*  账户等级（提供给app使用） */
                .state('accountLevel', {
                    url: '/accountLevel',
                    templateUrl: 'view/accountLevel.html'
                })
                .state('download', {
                    url: '/download',
                    templateUrl: 'view/download.html',
                    controllerUrl: 'controller/commCtrl',
                    controller: 'downloadCtrl'

                });
        }]);
});

