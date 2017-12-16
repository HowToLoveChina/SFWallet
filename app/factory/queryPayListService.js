/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
    //查询支付方式列表
    .factory('queryPayListService', ['$http', 'NirvanaUtil',function($http,NirvanaUtil) {
        var doRequest = function(tradeScene) {
            var requestTime=NirvanaUtil.timestamp();
            var key = NirvanaUtil.md5(requestTime);
            var serviceName = 'APP_SY_PAYMENT_METHOD';
            var obj={"serviceName":serviceName,"tradeScene":tradeScene,
                "requestTime":requestTime};
            var sign=NirvanaUtil.toSign(obj);
            tradeScene = NirvanaUtil.encrypt(tradeScene,key);
            return $http({
                method : 'POST',
                data : {
                    serviceName:serviceName,
                    charset:"UTF-8",
                    signType:"MD5",
                    requestTime:requestTime,
                    tradeScene:tradeScene,
                    sign:sign
                },
                url :  "h5-wallet-nirvana/cashPay/queryPayListForRecharge"
            });
        };
        return {
            query : function(tradeScene) {
                return doRequest(tradeScene);
            }
        };
    }])
});