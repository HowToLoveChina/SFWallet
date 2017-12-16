
/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {

    app
        .factory('authHttpService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            return {
                queryUserAuthInfo:function(phoneNumber){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var serviceName = "QUERY_USER_AUTH_INFO";
                    var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":phoneNumber,"platform":"H5","requestTime":requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(phoneNumber,key),//encrypt(phone,key),
                            appType : "001",
                            platform : NirvanaUtil.encrypt("H5",key),
                            serviceName : serviceName,
                            charset : "UTF-8",
                            signType : "DES",
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/queryUserAuthInfo'
                    });
                },//更新手机号验证支付密码
                validatePayPwdUpdateMobile:function(mobile,payPwd){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var serviceName = "VALIDATE_PAY_PWD_UPDATE_MOBILE";
                    var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":mobile,"payPwd":payPwd,"platform":"H5","requestTime":requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(mobile,key),//encrypt(phone,key),
                            payPwd : NirvanaUtil.encrypt(payPwd,key),
                            appType : "001",
                            platform : NirvanaUtil.encrypt("H5",key),
                            serviceName : serviceName,
                            charset : "UTF-8",
                            signType : "DES",
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/validatePayPwdUpdateMobile'
                    });
                },//修改顺手付账号
                updateSypayLoginName:function(mobile,newMobile,verify,userName,cardType,idCard,payPwd){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var serviceName = "UPDATE_SYPAY_LOGIN_NAME";
                    var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":mobile,"newMobile":newMobile,"verify":verify,"idCard":idCard,"payPwd":payPwd,"platform":"H5","requestTime":requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(mobile,key),//encrypt(phone,key),
                            newMobile : NirvanaUtil.encrypt(newMobile,key),
                            verify : NirvanaUtil.encrypt(verify,key),
                            userName : userName,
                            cardType : cardType,
                            idCard : NirvanaUtil.encrypt(idCard,key),
                            payPwd : NirvanaUtil.encrypt(payPwd,key),
                            appType : "001",
                            platform : NirvanaUtil.encrypt("H5",key),
                            serviceName : serviceName,
                            charset : "UTF-8",
                            signType : "DES",
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/updateSypayLoginName'
                    });
                },
            };
        }]);
});