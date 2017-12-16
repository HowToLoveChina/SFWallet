/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
        .factory('quickPayService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            var doRequest = function(businessNo,authNo,password,smsCode,smsMode,verifyRef,
                                     remark,cardType,bankCode,sfBankCode,bankName,dynamicFields,tradeScene) {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var obj={"serviceName":"QUICK_PAY",
                    "businessNo":businessNo,
                    "authNo":authNo,
                    "password":password,
                    "smsCode":smsCode,
                    "cardType":cardType,
                    "bankCode":bankCode,
                    "sfBankCode":sfBankCode,
                    "requestTime":requestTime};
                var sign=NirvanaUtil.toSign(obj);
                password = NirvanaUtil.encrypt(password,key);
                businessNo = NirvanaUtil.encrypt(businessNo,key);
                authNo = NirvanaUtil.encrypt(authNo,key);
                smsCode = NirvanaUtil.encrypt(smsCode,key);
                cardType = NirvanaUtil.encrypt(cardType,key);
                sfBankCode = NirvanaUtil.encrypt(sfBankCode,key);
                bankCode = NirvanaUtil.encrypt(bankCode,key);
                if(dynamicFields == null){
                    dynamicFields = "";
                }
                dynamicFields = NirvanaUtil.encrypt(dynamicFields,key);
                tradeScene = NirvanaUtil.encrypt(tradeScene,key);
                return $http({
                    method : 'POST',
                    data : {
                        serviceName:"QUICK_PAY",
                        charset:"UTF-8",
                        signType:"MD5",
                        requestTime:requestTime,
                        businessNo:businessNo,
                        sign:sign,
                        authNo:authNo,
                        password:password,
                        smsCode:smsCode,
                        smsMode:smsMode,
                        verifyRef:verifyRef,
                        remark:remark,
                        cardType:cardType,
                        bankCode:bankCode,
                        sfBankCode:sfBankCode,
                        bankName:bankName,
                        dynamicFields:dynamicFields,
                        tradeScene:tradeScene
                    },
                    url :  "h5-wallet-nirvana/cashPay/quickPay"
                });
            };
            return {
                pay : function(businessNo,authNo,password,smsCode,smsMode,verifyRef,
                               remark,cardType,bankCode,sfBankCode,bankName,dynamicFields,tradeScene) {
                    return doRequest(businessNo,authNo,password,smsCode,smsMode,verifyRef,
                        remark,cardType,bankCode,sfBankCode,bankName,dynamicFields,tradeScene);
                }
            };
        }]);

});