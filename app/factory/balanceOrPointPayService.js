/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
        .factory('balanceOrPointPayService', ['$http','NirvanaUtil',  function($http,NirvanaUtil) {
            var doRequest = function(serviceName,businessNo,password,payType,remark,tradeScene) {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var obj={"serviceName":serviceName,"businessNo":businessNo,"password":password,"payType":payType,"requestTime":requestTime};
                var sign=NirvanaUtil.toSign(obj);
                password = NirvanaUtil.encrypt(password,key);
                businessNo = NirvanaUtil.encrypt(businessNo,key);
                payType = NirvanaUtil.encrypt(payType,key);
                tradeScene = NirvanaUtil.encrypt(tradeScene,key);
                /*console.log("加密钱数据:",obj);
                 console.log("加密前的key:",requestTime);
                 console.log("加密后的数据businessNo：",businessNo);
                 console.log("加密后的payType:",payType);
                 console.log("加密后的key:",key);
                 console.log("加密后的tradeScene:",tradeScene);*/
                return $http({
                    method : 'POST',
                    data : {
                        serviceName:serviceName,
                        charset:"UTF-8",
                        signType:"MD5",
                        requestTime:requestTime,
                        businessNo:businessNo,
                        sign:sign,
                        password:password,
                        payType:payType,
                        remark:remark,
                        tradeScene:tradeScene
                    },
                    url :  "h5-wallet-nirvana/cashPay/balanceOrPointPay"
                });
            };
            return {
                pay : function(serviceName,businessNo,password,payType,remark,tradeScene) {
                    return doRequest(serviceName,businessNo,password,payType,remark,tradeScene);
                }
            };

        }])

});