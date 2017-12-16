/**
 * Created by 837781 on 2016/8/3.
 */
define(['CryptoJS', '$', 'app'], function (CryptoJS, $, app) {
    // window.onresize=function () {
    //     resetH();
    // };
    // function  resetH() {
    //   
    //     var t=setTimeout(function () {
    //         document.body.cssText='transform: translate3d(0,0,0);visibility: visible;';
    //         $(".pop").height($(document.body).height());
    //         clearTimeout(t);
    //        
    //
    //     },400)
    // }
    // var input= $('input[type=text],input[type=tel]').on("blur",function () {
    //     resetH();
    //     // alert(2)
    // });
    // $(document).on("click",'.tips',function () {
    //     resetH();
    //     input.blur();
    // });

    app
        .factory('Toast', [function () {
            /**
             * 模仿android里面的Toast效果，主要是用于在不打断程序正常执行的情况下显示提示数据
             * @param config
             * @return
             */
            return {
                show: function (message) {
                    if (message && message != '') {
                        var toastMessage = $("#toast");
                        toastMessage.html(message).removeClass("hidden");
                        var t = setTimeout(function () {
                            toastMessage.addClass("hidden");
                            clearTimeout(t);
                        }, 1500)

                    }
                }
            }
        }])
        .factory('StorageDataService', function () {

            var params = {
                'pamentObj': null,
                'createOrderData': null,
                'useCashCount': null,
                'toAddBankCode': null,
                'toGetPwdCode': null,
                'canRechargeCash': 0,
                'inputCash': null
            };
            //充值和提现支付密码页面数据缓存
            var inputpwdData = {
                'paymentObj': null,
                'walletType': null,
                'amt': null
            };
            //支付列表缓存数据
            var paylistData = {
                'walletType': null,
                'toAddBankCode': null,
                'businessNo': null
            };
            //绑定缓存数据
            var bindData = {
                'phoneNumber': '',
                'memberFlag': ''
            };
            //代扣数据
            var withholdData = {
                'withhodFlag': '',
                'bankModel': null
            };
            return {
                getParam: function (key) {
                    return params[key];
                },
                setParam: function (key, value) {
                    params[key] = value;
                },

                getInputPwdParam: function () {
                    return inputpwdData;
                },
                setInputPwdParam: function (obj) {
                    inputpwdData = obj;
                },
                getPaylistParam: function () {
                    return paylistData;
                },
                setPaylistParam: function (obj) {
                    paylistData = obj;
                },
                setBindDate: function (key, value) {
                    bindData[key] = value;
                },
                getBindDateByKey: function (key) {
                    return bindData[key];
                },
                setWthholdData: function (key, value) {
                    withholdData[key] = value;
                },
                getWthholdDataByKey: function (key) {
                    return withholdData[key];
                },
                clearAllData: function () {
                    params = null;
                },
                params: params
            };
        })
        .factory('NirvanaUtil', ['StorageDataService','$rootScope', function (StorageDataService,$rootScope) {
            var res = {
                encrypt: function (inputStr, key) {
                    if (typeof (inputStr) == "undefined" || inputStr == "") {
                        return "";
                    }
                    if (key == "" || key == null) {
                        return "";
                    }
                    if (key.length > 16) {
                        key = key.substring(0, 16);
                    }
                    key = CryptoJS.enc.Utf8.parse(key);
                    var iv = CryptoJS.enc.Utf8.parse('0102030405060708');
                    var srcs = CryptoJS.enc.Utf8.parse(inputStr);
                    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
                        iv: iv,
                        mode: CryptoJS.mode.CBC
                    });
                    return encrypted.toString();
                },
                //获得当前时间的时间戳
                timestamp: function () {
                    var date = new Date();
                    this.year = date.getFullYear();
                    this.month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
                    this.date = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//获取当前日(1-31)
                    this.day = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")[date.getDay()];
                    this.hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                    this.minute = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                    this.second = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                    this.milliseconds = date.getMilliseconds();
                    var currentTime = this.year + "" + this.month + "" + this.date + "" + this.hour + "" + this.minute + "" + this.second + this.milliseconds;
                    return currentTime;
                },
                toSign: function (obj) {
                    if (obj == null) {
                        return;
                    }
                    /*if (obj.requestTime == null || obj.requestTime == "") {
                     alert("请求参数错误：请求时间不能为空!");
                     return;
                     }*/
                    var timeStamp = obj.requestTime;// 请求时间
                    var key = CryptoJS.MD5(timeStamp) + '';// 签名秘钥
                    var str = "";
                    var strAttr = "";

                    for (var param in obj) {
                        str = param + "=" + obj[param];
                        strAttr += str + "&";
                    }
                    var endStr = strAttr.substring(0, strAttr.length - 1);
                    var pa = endStr + key;
                    // console.log("签名字符串\n"+pa);
                    var sign = CryptoJS.MD5(pa) + '';

                    return sign;
                },
                decrypt: function (input, key) {
                    if (key == "" || key == null) {
                        return "";
                    }
                    if (key.length > 16) {
                        key = key.substring(0, 16);
                    }
                    key = CryptoJS.enc.Utf8.parse(key);
                    var iv = CryptoJS.enc.Utf8.parse('0102030405060708');
                    var decrypted = CryptoJS.AES.decrypt(input, key, {
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Iso10126
                    });
                    return decrypted.toString(CryptoJS.enc.Utf8);
                },
                decryptRespone: function (data, key) {
                    if (data && key) {
                        var key = CryptoJS.MD5(key) + '';
                        if (key.length > 16) {
                            key = key.substring(0, 16);
                        }
                        key = CryptoJS.enc.Utf8.parse(key);
                        var iv = CryptoJS.enc.Utf8.parse('0102030405060708');
                        var decrypted = CryptoJS.AES.decrypt(data, key, {
                            iv: iv,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Iso10126
                        });
                        var str = decrypted.toString(CryptoJS.enc.Utf8);
                        // console.info(str);
                        return JSON.parse(str);
                    } else {
                        return {};
                    }
                },
                decryptWordRespone: function (data, key) {
                    if (data && key) {
                        var key = CryptoJS.MD5(key) + '';
                        if (key.length > 16) {
                            key = key.substring(0, 16);
                        }
                        key = CryptoJS.enc.Utf8.parse(key);
                        var iv = CryptoJS.enc.Utf8.parse('0102030405060708');
                        var decrypted = CryptoJS.AES.decrypt(data, key, {
                            iv: iv,
                            mode: CryptoJS.mode.CBC,
                            padding: CryptoJS.pad.Iso10126
                        });
                        var str = decrypted.toString(CryptoJS.enc.Utf8);
                        // console.info(str);
                        return str;
                    } else {
                        return "";
                    }
                },
                md5: function (key) {
                    return CryptoJS.MD5(key) + '';
                },
                //银行卡去后四位
                subBank: function (bankNo) {
                    if (!bankNo || bankNo == "") {
                        return "";
                    }
                    if (bankNo.length <= 4) {
                        return "";
                    }
                    var result = bankNo.replace(/(^\s+)|(\s+$)/g, "");
                    result = result.replace(/\s/g, "");
                    return replaceStr = result.substr(-4);
                },
                //去除空格is_global去掉字符串中所有空格(包括中间空格,需要设置第2个参数为:g)
                strTrim: function (str, is_global) {
                    var result;
                    result = str.replace(/(^\s+)|(\s+$)/g, "");
                    if (is_global != null) {
                        if (is_global.toLowerCase() == "g") {
                            result = result.replace(/\s/g, "");
                        }
                    }
                    return result;
                },
                trans2cerName: function (certType) {
                    var certTypeStr = '';
                    if ('SFZ' == certType) {
                        certTypeStr = '身份证';
                    } else if ('PASSPORT_TW' == certType) {
                        certTypeStr = '台湾居民来往大陆通行证';
                    } else if ('PASSPORT_HK' == certType) {
                        certTypeStr = '港澳居民往来内地通行证(香港)';
                    } else if ('PASSPORT_MC' == certType) {
                        certTypeStr = '港澳居民往来内地通行证(澳门)';
                    } else if ('PASSPORT' == certType) {
                        certTypeStr = '护照';
                    } else if ('HK_M_PASS' == certType) {
                        certTypeStr = '港澳台居民来往大陆通行证';
                    }
                    return certTypeStr;
                },
                trans2PayType: function (payType) {
                    var payTypeStr = '';
                    if ('BALANCE_PAY' == payType) {
                        payTypeStr = '账户余额';
                    } else if ('POINT_PAY' == payType) {
                        payTypeStr = '顺丰金';
                    } else if ('QUICK_PAY' == payType) {
                        payTypeStr = '银行卡支付';
                    } else if ('FUND_PAY' == payType) {
                        payTypeStr = '理财余额';
                    }
                    return payTypeStr;
                },
                doBack: function (state) {
                    if($rootScope.app == 'o2oRN'){//添加用来识别是否是新版本RN开发模式
                        if(state == 1){
                            try {WebViewBridge.send("successOperation");}catch (e) {}
                        }else{
                            try {WebViewBridge.send("interruptOperation");}catch (e) {}
                        }
                    }else{
                        if($rootScope.forwardUrl){//有forwordurl则跳转(说明非app接入)
                            window.location.href = $rootScope.forwardUrl;
                        }else{
                            if(res.browser().android){
                                try {
                                    FinishInterface.doFinishWeb(state);
                                } catch (e) {
                                }
                                try {
                                    SFPayHybrid.closeWindow();
                                } catch (e) {
                                }
                            }else if(res.browser().ios){//速运ios和安卓一样处理
                                try {
                                    SFPayHybrid.closeWindow();
                                } catch (e) {
                                }
                            }
                            window.history.back();
                        }
                    }
                },
                browser: function () {
                    var u = navigator.userAgent;
                    return { //移动终端浏览器版本信息
                        trident: u.indexOf('Trident') > -1, //IE内核
                        presto: u.indexOf('Presto') > -1, //opera内核
                        webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                        gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                        mobile: !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/), //是否为移动终端
                        ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                        android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                        iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
                        iPad: u.indexOf('iPad') > -1, //是否iPad
                        webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
                    };
                },
                //清除添卡过程中的缓存
                clearAddBankCardCache: function () {
                    //StorageDataService.setBindDate('phoneNumber', '');
                    StorageDataService.setBindDate('memberFlag', '');
                    sessionStorage.addCard_params = null;
                    sessionStorage.bankCardInfo_params = null;
                    sessionStorage.bankCardInfo2_params = null;
                    sessionStorage.certExtFlag = null;
                }
            };
            return res;
        }])
        .factory('checkMerchantDataService', ['$http', function ($http) {
            var doRequest = function (data) {
                if (typeof data == 'undefined') {
                    return;
                }
                data.serviceName = "CHECK_MERCHANT_DATA";
                data.serviceVersion = "V1.0.0";
                data.charset = "UTF-8";
                return $http({
                    method: 'POST',
                    data: data,
                    url: "h5-wallet-nirvana/crowdsourceAccess/checkMerchantData"
                });
            };
            return {
                checkMerchantData: function (data) {
                    return doRequest(data);
                }
            };
        }])
        //风声app打开钱包
        .factory('openWalletReqService', ['$rootScope','$http', function ($rootScope,$http) {
            var doRequest = function () {
                var requestTime = $rootScope.requestTime;
                var sign = $rootScope.sign;
                return $http({
                    method: 'POST',
                    data : {
                        data : $rootScope.data,
                        forwardUrl : $rootScope.forwardUrl,
                        serviceName : $rootScope.serviceName,
                        serviceVersion : $rootScope.serviceVersion,
                        charset : $rootScope.charset,
                        signType : $rootScope.signType,
                        requestTime : requestTime,
                        sign : sign
                    },
                    url: "h5-wallet-nirvana/openWalletReq"
                });
            };
            return {
                openWalletReq: function () {
                    return doRequest();
                }
            };
        }])
        //根据uac令牌进行认证登录
        .factory('authLoginService', ['$rootScope','$http','NirvanaUtil', function($rootScope,$http,NirvanaUtil){
            var doRequest = function() {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var obj={
                    "authToken":$rootScope.authToken,
                    "requestTime":requestTime};

                var sign = NirvanaUtil.toSign(obj);
                return $http({
                    method : 'POST',
                    data : {
                        authToken: $rootScope.authToken,
                        serviceName:'UNION_MEM_AUTH',
                        charset:'UTF-8',
                        signType:'MD5',
                        sign:sign,
                        requestTime:requestTime
                    },
                    url :"h5-wallet-nirvana/unionMemAuth/authLogin"
                });
            };
            return {
                authLogin : function() {
                    return doRequest();
                }
            };
        }])
        .factory('URLParseService', ['$rootScope', '$http', function ($rootScope, $http) {
            return {
                init: function () {
                    var urlSearch = decodeURIComponent(location.search),
                        urlHash = location.hash,
                        urlParams = [],
                        endpoints = {},
                        kvs = [];
                    urlSearch = urlSearch.indexOf('?') == 0 ? urlSearch.slice(1) : urlSearch;
                    urlSearch = urlSearch == '' ? urlHash : urlSearch;
                    urlSearch = urlSearch.indexOf('#/?') == 0 ? urlSearch.slice(3) : urlSearch;
                    urlSearch = urlSearch.indexOf('/') == urlSearch.length-1 ? urlSearch.slice(0,-1) : urlSearch;
                    urlParams = urlSearch != '' ? urlSearch.split('&') : [];
                    var len = urlParams.length;
                    for (var i = 0; i < len; i++) {
                        kvs = urlParams[i].split('=');
                        endpoints[kvs[0]] = kvs.length > 1 ? kvs[1] : '';
                    }
                    return endpoints;
                }
            };
        }])
//以下是 路由中 resolve 中 调用的方法 ……

        //该接口用于代扣签约扣款方式的查询，主要有如下三种：卡、余额、卡和余额。
        /*sceneCode 场景码
         merchantId 商户号
         businessCode 业务代码 代扣签约产品编码：251，如果sceneCode为空，则必传
         return 扣款类型 contractType 扣款类型，BALANCE：余额 BANKCARD：银行卡 ALL：余额和银行卡
         */
        .factory('WithholdType', ['$rootScope', '$http', 'NirvanaUtil',
            function ($rootScope, $http, NirvanaUtil) {
                return {
                    query: function () {
                        var requestTime = NirvanaUtil.timestamp();
                        var key = NirvanaUtil.md5(requestTime);
                        var sceneCode = $rootScope.sceneCode;
                        var merchantId = $rootScope.merchantId;
                        var businessCode = $rootScope.businessCode;

                        var sign = NirvanaUtil.toSign({
                            "businessCode": businessCode,
                            "merchantId": merchantId,
                            "sceneCode": sceneCode,
                            "requestTime": requestTime
                        });
                        return $http({
                            method: 'POST',
                            data: {
                                sceneCode: sceneCode,
                                merchantId: merchantId,
                                businessCode: businessCode,
                                platform: NirvanaUtil.encrypt("H5", key),
                                serviceName: "WITHHOLD_TYPE_QUERY",
                                charset: "UTF-8",
                                signType: "MD5",
                                requestTime: requestTime,
                                sign: sign
                            },
                            url: "h5-wallet-nirvana/withholding/findWithholdType"
                        });
                    }
                };
            }])

        /*判断是否实名，查询支持的证件类型*/
    /**
     商户号    merchantId    字符串    否    商户号 新结构下的场景码=merchantId+businessCode+productCode
     业务代码    businessCode    字符串    否    业务代码，需要商户传递，由顺手付分配，新结构下的场景码=merchantId+businessCode+productCode
     产品编码    productCode    字符串    否    产品编码
     场景码    tradeScene    字符串    否    场景码，如果是没有商户号的场景码，可以直接传递进该字段里
     **/
        .factory('queryIsRealNameAndSupportCertsService', ['$rootScope', '$http', 'NirvanaUtil', 'StorageDataService', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY',
            function ($rootScope, $http, NirvanaUtil, StorageDataService, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW, TRADESCENE_PAY) {
                return {
                    query: function () {
                        var requestTime = NirvanaUtil.timestamp();
                        var key = NirvanaUtil.md5(requestTime);
                        var productCode = '';
                        if ($rootScope.contractType != 'BALANCE') {
                            productCode = '251';
                        }
                        var tradeScene = '';
                        var code = StorageDataService.getParam('toAddBankCode');
                        if (code == 1) {//充值
                            tradeScene = TRADESCENE_RECHARGE;
                            productCode = '';
                        } else if (code == 2) {//提现
                            tradeScene = TRADESCENE_WITHDRAW;
                            productCode = '';
                        } else if (code == 99) {//绑定
                            tradeScene = $rootScope.merchantId + '9999999';
                            productCode = '';
                        } else if (code == 3 || code == 4 || code == 5 || code == 8) {//缴纳保证金、支付货款
                            tradeScene = TRADESCENE_PAY;
                            productCode = '';
                        }
                        var sign = NirvanaUtil.toSign({
                            "serviceName": "QUERY_SUPPORT_CERTS",
                            "requestTime": requestTime
                        });
                        return $http({
                            method: 'POST',
                            data: {
                                merchantId: $rootScope.merchantId,
                                businessCode: $rootScope.businessCode,
                                productCode: productCode,
                                tradeScene: tradeScene,
                                platform: NirvanaUtil.encrypt("H5", key),
                                appType: "001",
                                serviceName: "QUERY_SUPPORT_CERTS",
                                charset: "UTF-8",
                                signType: "MD5",
                                requestTime: requestTime,
                                sign: sign
                            },
                            url: "h5-wallet-nirvana/bankCard/querySupportCerts"
                        });
                    }
                };
            }])

        //代扣详情接口
        .factory('WithholdSignDetail', ['$http', 'NirvanaUtil',
            function ($http, NirvanaUtil) {
                return {
                    query: function (contractNo) {
                        var requestTime = NirvanaUtil.timestamp();
                        var key = NirvanaUtil.md5(requestTime);

                        var sign = NirvanaUtil.toSign({"contractNo": contractNo, "requestTime": requestTime});
                        return $http({
                            method: 'POST',
                            data: {
                                contractNo: contractNo,//协议号
                                platform: NirvanaUtil.encrypt("H5", key),
                                serviceName: "WITHHOLD_SIGN_DETAIL_QUERY",
                                charset: "UTF-8",
                                signType: "MD5",
                                requestTime: requestTime,
                                sign: sign
                            },
                            url: "h5-wallet-nirvana/withholding/queryWithholdSignDetail"
                        });
                    }
                };
            }])
});