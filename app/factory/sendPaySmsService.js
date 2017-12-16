/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
        .factory('sendPaySmsService', ['$http', 'NirvanaUtil',function($http,NirvanaUtil) {
            var doRequest = function(remark, isBankSendSms, businessNo, signNo,
                                     cardType, bankCode, sfBankCode, bankName,
                                     dynamicFields, amt,tradeScene) {
                var requestTime=NirvanaUtil.timestamp();
                var key = NirvanaUtil.md5(requestTime);
                var sign = "";
                var serviceName = "PAY_SMS";
                if(null == businessNo){
                    businessNo = '';
                }
                if("true" == isBankSendSms){
                    sign = NirvanaUtil.toSign({
                        "serviceName":serviceName,
                        "isBankSendSms":isBankSendSms,
                        "businessNo":businessNo,
                        "signNo":signNo,
                        "bankCode":bankCode,
                        "cardType":cardType,
                        "amt":amt,
                        "requestTime":requestTime});
                }else{
                    sign = NirvanaUtil.toSign({
                        "serviceName":serviceName,
                        "businessNo":businessNo});
                }
                return $http({
                    method : 'POST',
                    data : {
                        serviceName:serviceName,
                        charset:"UTF-8",
                        signType:"MD5",
                        requestTime:requestTime,
                        sign:sign,
                        remark : remark,
                        isBankSendSms : NirvanaUtil.encrypt(isBankSendSms,key),
                        businessNo : NirvanaUtil.encrypt(businessNo,key),
                        signNo : NirvanaUtil.encrypt(signNo,key),
                        cardType : NirvanaUtil.encrypt(cardType,key),
                        bankCode : NirvanaUtil.encrypt(bankCode,key),
                        sfBankCode : NirvanaUtil.encrypt(sfBankCode,key),
                        bankName : NirvanaUtil.encrypt(bankName,key),
                        dynamicFields : NirvanaUtil.encrypt(dynamicFields,key),
                        amt : NirvanaUtil.encrypt(amt,key),
                        tradeScene:NirvanaUtil.encrypt(tradeScene,key)
                    },
                    url :  "h5-wallet-nirvana/cashPay/sendPaySms"
                });
            };
            return {
                sendPaySms: function (remark, isBankSendSms, businessNo, signNo,
                                      cardType, bankCode, sfBankCode, bankName,
                                      dynamicFields, amt,tradeScene){
                    return doRequest(remark, isBankSendSms, businessNo, signNo,
                        cardType, bankCode, sfBankCode, bankName,
                        dynamicFields, amt,tradeScene);
                }
            };
        }]);

});