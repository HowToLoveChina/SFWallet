/*
 钱包控制器
 */

define(function (require){
    var app = require('../app');
    require('../factory/walletHttp');
    require("filter");
    require('../factory/createOrderService');
    require("../factory/formatNum");
    /*
     钱包控制器
     */
    app
        
        .controller('WalletCtrl', ['applayTokenService','FormatNum', 'querySFBalanceService', '$state',
            'queryWhetherBindCardService', 'StorageDataService', '$rootScope',
            '$scope', '$state', '$stateParams', 'queryUserMoneyInfoService',
            'downloadUrlService', 'NirvanaUtil', 'Toast', 'TRADESCENE_RECHARGE',
            'TRADESCENE_WITHDRAW','$compile','$document',
            function (applayTokenService,FormatNum, querySFBalanceService,
                      $state, queryWhetherBindCardService,
                      StorageDataService, $rootScope, $scope,
                      $state, $stateParams, queryUserMoneyInfoService,
                      downloadUrlService, NirvanaUtil, Toast,
                      TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW,
                      $compile,$document) {
                $scope.goBack = function () {
                    NirvanaUtil.doBack(0);
                };


                window.doKeyBack = function () {
                    $scope.goBack();
                };

                $rootScope.errMsg = "未知错误";
                $scope.headTitle = '钱包';
                if ($rootScope.memberType == 'MBR-SFEXP') {//速运钱包主页应该展示账户余额
                    $scope.headTitle = '账户余额';
                }
                $scope.isShowFlag = false;

                StorageDataService.setParam('inputCash', null);
                var merchantId = $rootScope.merchantId;
                var openId = $rootScope.openId;
                var userId = $rootScope.userId;


                if ($rootScope.serviceName == 'MEMBER_SFPAY_WALLET' || $rootScope.serviceName == 'SY_MCH_OPEN_WALLET_REQ') {//接收UAC进入逻辑直接调用查询余额或者丰声进入钱包
                    querySFBalance();
                } else {
                    queryUserMoneyInfo();
                }


                $scope.walletRechargeFunc = function () {
                    queryWhetherBindCard('DEBIT', 1);
                }


                $scope.walletCashFunc = function () {
                    queryWhetherBindCard('DEBIT', 2);
                }


                $scope.listCardFunc = function () {
                    var paylistData = {
                        'walletType': 1,
                        'toAddBankCode': 1,
                        'businessNo': null
                    };
                    StorageDataService.setPaylistParam(paylistData);
                    StorageDataService.setParam('inputCash', $scope.rechargeCount);
                    $state.go('bankList');
                };

                $scope.tradeListFunc = function () {
                    $state.go("tradeList");
                };

                $scope.goSecurityHome = function () {
                    $state.go("securityHome");
                };
                /**
                 * 红包
                 */
                $scope.redPacketFunc = function () {
                    applayToken();
                    //window.location.href = "http://10.118.192.146:8091?serviceName=WALLET_TO_RP&forwardUrl=" + $rootScope.forwardUrl;
                }
                /**
                 * 申请授权token
                 */
                function applayToken(){
                    $rootScope.loading = true;
                    applayTokenService.applayToken().success(function(response){
                        $rootScope.loading = false;
                        if(response.rltCode == '00'){
                            var data = JSON.parse(response.data);
                            var accessToken = data.accessToken;
                            //var merchantId = data.merchantId;
                            var urlPre = data.urlPre;
                            //下一步跳转到红包模块
                            //var url_pre = "http://10.118.192.132:8091";
                            var tempUrlHost = window.location.href;
                            var redirectUrl = encodeURIComponent(encodeURIComponent(tempUrlHost.substr(0, tempUrlHost.indexOf('#/'))));
                            window.location.href = urlPre + "?serviceName=WALLET_TO_RP&accessToken="
                            + accessToken + "&forwardUrl=" + $rootScope.forwardUrl +
                            "&redirectUrl=" + redirectUrl;
                        }else if (response.rltCode == '14021') {
                            $state.go('accountErr');

                        } else if (response.rltCode == '9504') {
                            $rootScope.errMsg = '登录已失效，请重新登录';
                            $state.go('404');
                        } else {
                            $rootScope.errMsg = response.rltMsg;
                            $state.go('404');
                        }
                    }).error(function(response){
                        $rootScope.loading = false;
                        $rootScope.errMsg = "SY_MCH_OPEN_WALLET_REQ服务请求异常";
                        $state.go('404');
                    });
                }

                $scope.isActivated = true;  //用户账户已激活
                if ($rootScope.isRealName == 'N') {//uac过来通过authtoken去查询接口返回是否已经实名决定显示该区域
                    $scope.isActivated = false;
                }
                // $scope.hasBoxCell = false;   //


                function queryUserMoneyInfo() {
                    $rootScope.loading = true;

                    queryUserMoneyInfoService.queryUserMoneyInfo(merchantId, openId, userId)
                        .success(function (response) {
                            $rootScope.loading = false;

                            if (response.rltCode == '00') {
                                $scope.isShowFlag = true;

                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                $rootScope.cashCount = data.lastMoney;
                                //冻结余额
                                $scope.freezeCount = data.freezeCount;
                                //可用余额
                                $rootScope.usableCount = data.usableCount;
                                $rootScope.userMobile = data.mobile;

                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                           
                            }else if(response.rltCode == '9504'){
                                _alert('登录已失效，请重新登录');
                            }  else {
                                $rootScope.errMsg = response.rltMsg;
                                $state.go('404');
                            }
                            ;
                        }).error(function (response) {
                            $rootScope.loading = false;
                            $rootScope.errMsg = "服务请求异常";
                            $state.go('404');
                        });
                }


                /**
                 * 查询是否已经绑卡
                 * @param cardType
                 * @param doType
                 */
                function queryWhetherBindCard(cardType, doType) {
                    $rootScope.loading = true;

                    queryWhetherBindCardService.queryWhetherBindCard($rootScope.userMobile, cardType)
                        .success(function (response) {
                            $rootScope.loading = false;

                            if (response.rltCode == '00') {
                                var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                if ('0' == data.bindCardFlag) {//0：未绑卡
                                    if (1 == doType) {//充值
                                        $rootScope.sceneCode = TRADESCENE_RECHARGE;

                                        StorageDataService.setParam('toAddBankCode', 1);
                                        $rootScope.notWithholdSign = 'Y';
                                        $state.go('bankcardAdd');
                                    } else {
                                        $rootScope.sceneCode = TRADESCENE_WITHDRAW;

                                        StorageDataService.setParam('toAddBankCode', 2);
                                        $rootScope.notWithholdSign = 'Y';
                                        $state.go('bankcardAdd');
                                    }

                                } else {//1：已绑卡
                                    if (1 == doType) {//充值
                                        StorageDataService.setParam('paymentObj', null);
                                        $state.go('walletRecharge');
                                    } else {
                                        $state.go('walletCash');
                                    }
                                }


                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                           
                            } else if(response.rltCode == '9504'){
                                _alert('登录已失效，请重新登录');
                            }  else {
                                $rootScope.errMsg = response.rltMsg;
                                $state.go('404');

                            }
                            ;
                        }).error(function (response) {
                            $rootScope.loading = false;
                            $rootScope.errMsg = response.rltMsg;
                            $state.go('404');
                        });
                }


                /**
                 * 查询余额
                 */
                function querySFBalance() {
                    $rootScope.loading = true;

                    querySFBalanceService.querySFBalance().success(function (response) {
                        $rootScope.loading = false;

                        if (response.rltCode == "00") {
                            $scope.isShowFlag = true;
                            var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            $rootScope.cashCount = data.balance;
                            //冻结余额
                            $scope.freezeCount = data.freezeBalance;
                            //可用余额
                            $rootScope.usableCount = data.avaiBalance;
                        } else if (response.rltCode == '14021') {
                            $state.go('accountErr');
                        } else if(response.rltCode == '9504'){
                            _alert('登录已失效，请重新登录');
                        } else {
                            $rootScope.errMsg = response.rltMsg;
                            $state.go('404');
                        };
                    }).error(function (response) {
                        $rootScope.loading = false;
                        $rootScope.errMsg = "服务请求异常";
                        $state.go('404');
                    });
                }


                /**
                 * 去实名(走实名绑卡流程)
                 */
                $scope.realNameFunc = function () {
                    //$rootScope.sceneCode = TRADESCENE_RECHARGE;
                    StorageDataService.setParam('toAddBankCode', 13);//进入添卡操作之后的流程

                    $rootScope.notWithholdSign = 'Y';
                    $state.go('bankcardAdd');
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
            }])


});