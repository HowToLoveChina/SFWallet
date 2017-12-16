/**
 * Created by SF on 7/5/16.
 */
define(['require', 'app'], function (require, app) {
    app
        .controller('LoadCtrl', ['openWalletReqService','$rootScope', '$scope', '$state', 'checkMerchantDataService', 'authLoginService', 'URLParseService', 'NirvanaUtil', 'StorageDataService',
            function (openWalletReqService,$rootScope, $scope, $state, checkMerchantDataService, authLoginService, URLParseService, NirvanaUtil, StorageDataService) {

            if ($rootScope.backFlag == 'Y') {//这个页面跳出去的标识，不论state.go还是href（从该页面跳出去必须将它置于'Y'），浏览器自带返回键自动跳转上一个页面(防止浏览器自带返回键点击)
                $rootScope.backFlag = 'N';
                window.history.go(-2);
                return;
            }
            $scope.goBack = function () {
                NirvanaUtil.doBack(0);
            };
            window.doKeyBack = function () {
                NirvanaUtil.doBack(0);
            };
            $rootScope.loading = false;

            //var requestTime=NirvanaUtil.timestamp();
            //var amt = 1;var authNo = 2;
            //var sign = NirvanaUtil.toSign({"amt":amt,"authNo":authNo,"requestTime":requestTime});


            //var data = NirvanaUtil.decryptRespone('rDvTBk7nTYcG4aSVMIRO9XBUipbFaWkoJ1gbiXuTIpvVHG1mvAopAVdulv7Qeuv0KxUymvk9bnqlM1JZ0Vhu+GBeAMjV/14h1hmpE1lKvUBpqmXA0rOpLd1djY9hEFKdOBjyaAYODcB5OQ0aGoXn4EhvwbyQf2w5OYQ0Cm0KB+SH42Zeu6l2PqCSVCfPo92efgQI2lIu/1j/jnH0O7u1k6gJ6YdGF9GKbTn4gw0qc+5iWqPqhGGOFNQPk1eSCk1ITe7bwOzn99taxGl9hqQGUdR8M57YdU+/EKl61R0GGzaNd5MXTDyNqNCf6Lu6gmBam2fyXWfkU2kcfsConcp373hoI9hImc4Sh25xD3yoIz+Q2HFxPEQxRDRl8nRlBxsAhZDquo+3q3ywOKKdkFgl9xeCbAnOyS9X0FNKPjSdKFBZt/whYVApY4rz5eqy2s7c5DAsNRrI2Nm+DDdIYmrdxef6Jezs4zT2MHCH+o+9Nfg=','20161025143425');
            //console.log(data);
            //标准化由商户传入，众包由初始化返回
            $rootScope.businessCode = '';
            $rootScope.sceneCode = '';

            var urlSearch = URLParseService.init();
            var serviceName = urlSearch['serviceName'];
            var serviceVersion = urlSearch['serviceVersion'];
            var charset = urlSearch['charset'];
            var signType = urlSearch['signType'];
            var requestTime = urlSearch['requestTime'];
            $rootScope.merchantId = urlSearch['merchantId'] || '';
            $rootScope.forwardUrl = urlSearch['forwardUrl'] || '';
            $rootScope.memberType = urlSearch['memberType'] || '';

            $rootScope.notifyUrl = urlSearch['notifyUrl'] || '';

            console.log("merchantId:" + $rootScope.merchantId +
            "&forwardUrl:" + $rootScope.forwardUrl +
            "&memberType:" + $rootScope.memberType);

            var userMobile = '';
            var userId = '';
            var userName = '';
            var sign = '';
            var openId = '';
            var businessType = '';
            var orderId = '';
            var amt = '';
            var ccy = '';
            var orderBeginTime = '';
            var goodsName = '';
            var goodsDesc = '';
            var goodsUrl = '';
            var merBusinessType = '';
            var reserved = '';

            var clientIp = '';
            var ext1 = '';
            var ext2 = '';
            var ext3 = '';
            var orderExpDate = '';
            var businessCode = '';
            var tradeScene = '';
            var serviceType = '';


            // 【同城配钱包入口】钱包颜色应设置蓝色；速运 红色， 默认 红色， 丰巢 绿色
            var color;
            // console.log(merchantId);
            // console.log(typeof (merchantId));
            // APP-SFEXP(速运通APP)
            // APP-SYPAY（顺手付）
            // WECHAT-SFEXP（微信）
            // ALIPAY（支付宝）
            // HIVEBOX(丰巢)
            // H5-LOTTERY (顺丰彩H5专区)
            // UPP 统一收银台
            // H5-WALLET
            // OTHER(其它)
            //同城配 蓝色
            if (serviceName == 'SFPAY_WALLET') {
                console.log('memberType同城配');
                //color='#DC1E32';
                color = '#1E90FF';
            } else {
                switch ($rootScope.memberType) {
                    //默认 红色
                    default:
                        color = '#ff6c6a';
                        break;
                    //丰巢 绿色
                    case 'MBR-HIVEBOX':
                        //绿色
                        color = '#1B9D17';
                        break;
                    //速运 红色
                    case 'MBR-SFEXP':
                        //红色
                        color = '#ff6b7c';
                        break;
                }
            }
            var styleEl = document.createElement('style');
            styleEl.innerHTML = '.moneyBg,.btn-sub,.lot-btn{background-color:' + color + ';}';
            document.querySelector('head').appendChild(styleEl);


            if (serviceName == 'MEMBER_SFPAY_WALLET') {//接收UAC进入逻辑
                $rootScope.authToken = urlSearch['authToken'];
                authLogin();

            } else if (serviceName == 'BIND_USER') {//绑定顺手付账户
                userMobile = urlSearch['userMobile'];
                userId = urlSearch['userId'];
                userName = urlSearch['userName'];
                sign = urlSearch['sign'];
                businessCode = urlSearch['businessCode'];
                $rootScope.notifyUrl = urlSearch['notifyUrl'];
                serviceType = 'BIND_USER';
                checkMerchantData();
            } else if (serviceName == 'SFPAY_WALLET') {//钱包


                openId = urlSearch['openId'];
                userId = urlSearch['userId'];
                sign = urlSearch['sign'];
                serviceType = 'SF_WALLET';

                checkMerchantData();
            } else if (serviceName == 'PAY') {//支付
                businessType = urlSearch['businessType'];
                openId = urlSearch['openId'];
                orderId = urlSearch['orderId'];
                amt = urlSearch['amt'];
                ccy = urlSearch['ccy'];
                orderBeginTime = urlSearch['orderBeginTime'];
                goodsName = urlSearch['goodsName'];
                goodsDesc = urlSearch['goodsDesc'];
                goodsUrl = urlSearch['goodsUrl'];
                merBusinessType = urlSearch['merBusinessType'];
                reserved = urlSearch['reserved'];
                $rootScope.notifyUrl = urlSearch['notifyUrl'];
                clientIp = urlSearch['clientIp'];
                ext1 = urlSearch['ext1'];
                ext2 = urlSearch['ext2'];
                ext3 = urlSearch['ext3'];
                orderExpDate = urlSearch['orderExpDate'];
                businessType = urlSearch['businessType'];
                businessCode = urlSearch['businessCode'];
                sign = urlSearch['sign'];

                serviceType = 'PAY';
                checkMerchantData();
            } else if (serviceName == 'ROUTE_WITHHOLD_DETAIL') {
                if (urlSearch['TOKEN_ID']) {
                    document.cookie = "SFPAY_JSESSIONID=" + urlSearch['TOKEN_ID'];
                }
                $rootScope.contractNo = urlSearch['contractNo'];
                $rootScope.sourceType = urlSearch['sourceType'];
                $rootScope.backFlag = 'Y';
                $state.go('withholdingSwitch');
            } else if (serviceName == 'ADD_BANK_CARD') {//丰海贷接入添卡流程
                if (urlSearch['TOKEN_ID']) {
                    document.cookie = "SFPAY_JSESSIONID=" + urlSearch['TOKEN_ID'];
                }
                $rootScope.businessCode = urlSearch['businessCode'];
                $rootScope.productCode = urlSearch['productCode'];
                $rootScope.tradeScene = urlSearch['tradeScene'];
                $rootScope.forwardUrl = decodeURIComponent(urlSearch['forwardUrl']);
                var isRegister = urlSearch['isRegister'] ? urlSearch['isRegister'] : 'N';//'Y'账号已注册，'N'未注册
                var notWithholdSign = urlSearch['notWithholdSign'] ? urlSearch['notWithholdSign'] : '';//'Y'不用开通代扣服务，'N'开通代扣
                StorageDataService.setParam('toAddBankCode', 12);
                $rootScope.notWithholdSign = notWithholdSign;
                $rootScope.isRegister = isRegister;
                $rootScope.backFlag = 'Y';
                $state.go('bankcardAdd');
            } else if (serviceName == 'SFPAY_ACCOUNTLEVEL') {//等级说明书
                $rootScope.backFlag = 'Y';
                $state.go('accountLevel');
            } else if(serviceName == 'SY_MCH_OPEN_WALLET_REQ'){//风声app跳转到钱包
                openWalletReq();
                //$rootScope.serviceName = urlSearch['serviceName'] || '';
                //$state.go('wallet');
            }else {
                $rootScope.backFlag = 'Y';
                $rootScope.errMsg = 'serviceName类型错误';
                $state.go('404');
            }
            /**
             * 根据uac令牌进行认证登录
             */
            function authLogin() {
                $rootScope.loading = true;
                authLoginService.authLogin().success(function (response) {
                    $rootScope.loading = false;
                    if (response.rltCode == "00") {
                        var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                        if (data.status == 'success') {
                            $rootScope.isRealName = data.isRealName;
                            $rootScope.userMobile = data.mobile;
                            $rootScope.serviceName = 'MEMBER_SFPAY_WALLET';
                            $rootScope.backFlag = 'Y';
                            $state.go('wallet');
                        } else {
                            $rootScope.backFlag = 'Y';
                            $rootScope.errMsg = '认证登录失败';
                            $state.go('404');
                        }
                    } else {
                        $rootScope.backFlag = 'Y';
                        $rootScope.errMsg = response.rltMsg;
                        $state.go('404');
                    }
                }).error(function (response) {
                    $rootScope.loading = false;
                    $rootScope.backFlag = 'Y';
                    $rootScope.errMsg = 'UNION_MEM_AUTH服务请求异常';
                    $state.go('404');
                });
            }

            /**
             * 丰声打开顺手付钱包请求
             */
            function openWalletReq(){
                $rootScope.loading = true;

                $rootScope.serviceName = urlSearch['serviceName'] || '';
                $rootScope.serviceVersion = urlSearch['serviceVersion'] || '';
                $rootScope.charset = urlSearch['charset'] || '';
                $rootScope.signType = urlSearch['signType'] || '';
                $rootScope.sign = urlSearch['sign'] || '';
                $rootScope.requestTime = urlSearch['requestTime'] || '';

                $rootScope.forwardUrl = urlSearch['forwardUrl'] || '';
                $rootScope.data = urlSearch['data'] || '';

                openWalletReqService.openWalletReq().success(function(response){
                    $rootScope.loading = false;
                    if (response.rltCode == "00") {
                        var data = JSON.parse(response.data);
                        $rootScope.merchantId = data.merchantId;
                        $rootScope.userMobile = data.mobile;
                        $rootScope.isRealName = data.isRealName;
                        $rootScope.backFlag = 'Y';
                        $state.go('wallet');
                    } else if (response.rltCode == '14021') {
                        $rootScope.backFlag = 'Y';
                        $state.go('accountErr');
                    } else {
                        $rootScope.backFlag = 'Y';
                        $rootScope.errMsg = response.rltMsg;
                        $state.go('404');
                    }
                }).error(function(response){
                    $rootScope.loading = false;
                    $rootScope.backFlag = 'Y';
                    $rootScope.errMsg = "SY_MCH_OPEN_WALLET_REQ服务请求异常";
                    $state.go('404');
                });
            }

            //初始化目前根据商户（众包和第三方标准接入，众包会返回notyfyUrl和businessCode,第三方商户有接入参数传入）
            function checkMerchantData() {
                $rootScope.loading = true;
                var _data = {
                    sign: sign,
                    signType: signType,
                    requestTime: requestTime,
                    serviceType: serviceType,
                    merchantId: $rootScope.merchantId,
                    userMobile: userMobile,
                    userId: userId,
                    userName: userName,
                    openId: openId,
                    orderId: orderId,
                    amt: amt,
                    ccy: ccy,
                    orderBeginTime: orderBeginTime,
                    goodsName: goodsName,
                    goodsDesc: goodsDesc,
                    goodsUrl: goodsUrl,
                    merBusinessType: merBusinessType,
                    reserved: reserved,
                    notifyUrl: $rootScope.notifyUrl,
                    clientIp: clientIp,
                    ext1: ext1,
                    ext2: ext2,
                    ext3: ext3,
                    orderExpDate: orderExpDate,
                    businessType: businessType,
                    businessCode: businessCode,
                    tradeScene: tradeScene
                };
                checkMerchantDataService.checkMerchantData(_data)
                    .success(function (response) {
                        $rootScope.loading = false;
                        if (response.rltCode == "00") {
                            var data = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            // console.log(data)
                            if (serviceName == 'BIND_USER') {
                                $rootScope.bindMemberInfo = data.bindMemberInfo;
                                $rootScope.merchantId = NirvanaUtil.decryptWordRespone(data.merchantId, data.requestTime);
                                $rootScope.userId = NirvanaUtil.decryptWordRespone(data.userId, data.requestTime);
                                $rootScope.userMobile = NirvanaUtil.decryptWordRespone(data.userMobile, data.requestTime);
                                $rootScope.userName = data.userName;
                                if (data.notifyUrl) {
                                    $rootScope.notifyUrl = data.notifyUrl;
                                } else {
                                    $rootScope.notifyUrl = '';
                                }
                                if (data.businessCode && data.businessCode != "null") {
                                    $rootScope.businessCode = data.businessCode;
                                } else {
                                    $rootScope.businessCode = '';
                                }
                                if (data.contractNo) {//代扣签约号
                                    $rootScope.contractNo = data.contractNo;
                                } else {
                                    $rootScope.contractNo = '';
                                }
                                $rootScope.backFlag = 'Y';
                                $state.go('bind');
                            } else if (serviceName == "SFPAY_WALLET") {
                                $rootScope.bindMemberInfo = data.bindMemberInfo;
                                $rootScope.merchantId = NirvanaUtil.decryptWordRespone(data.merchantId, data.requestTime);
                                $rootScope.userId = NirvanaUtil.decryptWordRespone(data.userId, data.requestTime);
                                $rootScope.openId = NirvanaUtil.decryptWordRespone(data.openId, data.requestTime);
                                $rootScope.userMobile = data.userMobile;
                                $rootScope.userName = data.userName;
                                if (data.notifyUrl) {
                                    $rootScope.notifyUrl = data.notifyUrl;
                                } else {
                                    $rootScope.notifyUrl = '';
                                }
                                $rootScope.backFlag = 'Y';
                                $state.go('wallet');
                            } else if (serviceType == "PAY") {
                                $rootScope.bindMemberInfo = data.bindMemberInfo;
                                $rootScope.merchantId = NirvanaUtil.decryptWordRespone(data.merchantId, data.requestTime);
                                $rootScope.openId = data.openId;
                                $rootScope.userId = NirvanaUtil.decryptWordRespone(data.userId, data.requestTime);
                                $rootScope.userMobile = NirvanaUtil.decryptWordRespone(data.userMobile, data.requestTime);
                                $rootScope.userName = data.userName;
                                $rootScope.amt = NirvanaUtil.decryptWordRespone(data.payOrder.amt, data.requestTime);
                                $rootScope.businessCode = data.payOrder.businessCode;
                                $rootScope.businessType = data.payOrder.businessType;
                                $rootScope.ccy = data.payOrder.ccy;
                                $rootScope.clientIp = data.payOrder.clientIp;
                                $rootScope.ext1 = data.payOrder.ext1;
                                $rootScope.ext2 = data.payOrder.ext2;
                                $rootScope.ext3 = data.payOrder.ext3;
                                $rootScope.goodsDesc = data.payOrder.goodsDesc;
                                $rootScope.goodsName = data.payOrder.goodsName;
                                $rootScope.goodsUrl = data.payOrder.goodsUrl;
                                $rootScope.merBusinessType = data.payOrder.merBusinessType;
                                $rootScope.notifyUrl = NirvanaUtil.decryptWordRespone(data.payOrder.notifyUrl, data.requestTime);
                                $rootScope.orderBeginTime = data.payOrder.orderBeginTime;
                                $rootScope.orderExpDate = data.payOrder.orderExpDate;
                                $rootScope.orderId = NirvanaUtil.decryptWordRespone(data.payOrder.orderId, data.requestTime);
                                $rootScope.remark = data.payOrder.remark;
                                $rootScope.reserved = data.payOrder.reserved;
                                $rootScope.tradeScene = data.payOrder.tradeScene;
                                if (businessType == 'pay_deposit') {//缴纳保证金
                                    $rootScope.backFlag = 'Y';
                                    $state.go('depositSure');
                                } else if (businessType == 'pay_order') {//支付订单
                                    $rootScope.backFlag = 'Y';
                                    $state.go('pay');
                                }
                            } else {
                                $rootScope.backFlag = 'Y';
                                $rootScope.errMsg = "serviceType错误";
                                $state.go('404');
                            }
                        } else if (response.rltCode == '14021') {
                            $rootScope.backFlag = 'Y';
                            $state.go('accountErr');
                        } else {
                            $rootScope.backFlag = 'Y';
                            $rootScope.errMsg = response.rltMsg;
                            $state.go('404');
                        }
                    }).error(function (response) {
                        $rootScope.loading = false;
                        $rootScope.backFlag = 'Y';
                        $rootScope.errMsg = "CHECK_MERCHANT_DATA服务请求异常";
                        $state.go('404');
                    });
            }
        }])


        .controller('accountErrCtrl', ['$scope', '$rootScope', 'NirvanaUtil', function ($scope, $rootScope, NirvanaUtil) {
            $scope.goBack = function () {
                NirvanaUtil.doBack(0);
            };
            window.doKeyBack = function () {
                NirvanaUtil.doBack(0);
            };
            $rootScope.loading = false;
        }])
        .controller('ErrCtrl', ['$rootScope', '$scope', 'NirvanaUtil', function ($rootScope, $scope, NirvanaUtil) {
            $scope.goBack = function () {
                NirvanaUtil.doBack(0);
            };
            window.doKeyBack = function () {
                NirvanaUtil.doBack(0);
            };
            $rootScope.loading = false;
            if(!$rootScope.errMsg){
                $rootScope.errMsg = '未知错误';
            }

        }])
        .controller('exceptionCtrl', ['$scope', function ($scope) {

            $scope.goBack = function () {
                window.history.back();
            };
            window.doKeyBack = function () {
                window.history.back();
            }

        }])
        //下载App界面 hash:download
        .controller('downloadCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
            $scope.goBack = function () {
                window.history.back();
            };
            window.doKeyBack = function () {
                $scope.goBack();
            }
            var frame = document.getElementById("iframeC");
            frame.src = $rootScope.downloadAppURL;
        }]);


});


