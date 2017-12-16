/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
    app
        .factory('modifyPayPwdHttpService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            return {
                //修改支付密码接口
                updatePayPassWord:function(mobile,oldPwd,newPwd,verify){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var serviceName = "UPDATE_PAY_PASSWORD";
                    var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":mobile,"oldPwd":oldPwd,"newPwd":newPwd,"verify":verify,"platform":"H5",'requestTime':requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(mobile,key),//encrypt(phone,key),
                            platform : NirvanaUtil.encrypt("H5",key),
                            oldPwd : NirvanaUtil.encrypt(oldPwd,key),
                            newPwd : NirvanaUtil.encrypt(newPwd,key),
                            verify : NirvanaUtil.encrypt(verify,key),
                            serviceName : serviceName,
                            charset : "UTF-8",
                            signType : "DES",
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/updatePayPassWord'
                    });
                }
            };
        }]);

});