/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
        .factory('createOrderService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            var doRequest = function(merchantId,orderId,amt,ccy,orderBeginTime,goodsName,goodsDesc,goodsUrl,
                                     merBusinessType,reserved,notifyUrl,
                                     clientIp,ext1,ext2,ext3,orderExpDate,openId,tradeScene) {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var obj={
                    "merchantId":merchantId,
                    "orderId":orderId,
                    "amt":amt,
                    "ccy":ccy,
                    "notifyUrl":notifyUrl,
                    "requestTime":requestTime};

                var sign=NirvanaUtil.toSign(obj);
                return $http({
                    method : 'POST',
                    data : {
                        serviceName:'CREATE_ORDER',
                        charset:'UTF-8',
                        signType:'MD5',
                        sign:sign,
                        requestTime:requestTime,
                        merchantId : NirvanaUtil.encrypt(merchantId,key),
                        orderId  : NirvanaUtil.encrypt(orderId, key),
                        amt : NirvanaUtil.encrypt(amt, key),
                        ccy:ccy,
                        orderBeginTime : orderBeginTime,
                        goodsName : goodsName,
                        goodsDesc : goodsDesc,
                        goodsUrl : goodsUrl,
                        reserved : reserved,
                        notifyUrl : NirvanaUtil.encrypt(notifyUrl, key),
                        clientIp : clientIp,
                        ext1 : ext1,
                        ext2 : ext2,
                        ext3 : ext3,
                        orderExpDate : orderExpDate,
                        openId:openId,
                        merBusinessType : merBusinessType,
                        tradeScene : NirvanaUtil.encrypt(tradeScene, key)
                    },
                    url :"h5-wallet-nirvana/cashPay/createOrder"
                });
            };
            return {
                createOrder : function(merchantId,orderId,amt,ccy,orderBeginTime,goodsName,goodsDesc,goodsUrl,
                                       merBusinessType,reserved,notifyUrl,
                                       clientIp,ext1,ext2,ext3,orderExpDate,openId,tradeScene) {
                    return doRequest(merchantId,orderId,amt,ccy,orderBeginTime,goodsName,goodsDesc,goodsUrl,
                        merBusinessType,reserved,notifyUrl,
                        clientIp,ext1,ext2,ext3,orderExpDate,openId,tradeScene);
                }
            };
        }]).factory('querySFBalanceService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            var doRequest = function() {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var obj={
                    "serviceName":'QUERY_SF_BALANCE',
                    "requestTime":requestTime};

                var sign = NirvanaUtil.toSign(obj);
                return $http({
                    method : 'POST',
                    data : {
                        serviceName:'QUERY_SF_BALANCE',
                        charset:'UTF-8',
                        signType:'MD5',
                        sign:sign,
                        requestTime:requestTime
                    },
                    url :"h5-wallet-nirvana/tradeQuery/querySFBalance"
                });
            };
            return {
                querySFBalance : function() {
                    return doRequest();
                }
            };
        }])


});