/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
    app
    //查询z缴纳和支付方式列表
        .factory('queryPaymentListService', ['$http', 'NirvanaUtil',function($http,NirvanaUtil) {
            return {
                query : function(tradeScene,businessNo) {
                    var requestTime=NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);
                    var serviceName = 'PAYMENT_LIST';
                    var obj={"serviceName":serviceName,"businessNo":businessNo,
                        "requestTime":requestTime};
                    var sign=NirvanaUtil.toSign(obj);
                    businessNo = NirvanaUtil.encrypt(businessNo,key);
                    tradeScene = NirvanaUtil.encrypt(tradeScene,key);
                    return $http({
                        method : 'POST',
                        data : {
                            serviceName:serviceName,
                            charset:"UTF-8",
                            signType:"MD5",
                            requestTime:requestTime,
                            businessNo:businessNo,
                            tradeScene:tradeScene,
                            sign:sign
                        },
                        url :  "h5-wallet-nirvana/cashPay/queryPayList"
                    });
                }
            };
        }])
        //查询会员绑定银行卡
        .factory('queryCardListService', ['$http', 'NirvanaUtil',function($http,NirvanaUtil) {
            return {
                query : function() {
                    var requestTime=NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);
                    var serviceName = 'QUERY_MEM_BANKLIST';
                    var obj={"serviceName":serviceName,
                        "requestTime":requestTime};
                    var sign=NirvanaUtil.toSign(obj);

                    return $http({
                        method : 'POST',
                        data : {
                            serviceName:serviceName,
                            charset:"UTF-8",
                            signType:"MD5",
                            requestTime:requestTime,
                            sign:sign
                        },
                        url :  "h5-wallet-nirvana/memBankCard/queryCardList"
                    });
                }
            };
        }]);
});

