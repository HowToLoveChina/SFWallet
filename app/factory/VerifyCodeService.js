/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
	app
		.factory('VerifyCodeService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			return {
				send:function(phoneNumber,sence){
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var phoneNumber = phoneNumber==undefined?'':phoneNumber;
					var sign = NirvanaUtil.toSign({"serviceName":"SEND_SMS","smsScene":sence,"mobile":phoneNumber,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNumber,key),//encrypt(phone,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "SEND_SMS",
							charset : "UTF-8",
							signType : "DES",
							smsScene : NirvanaUtil.encrypt(sence,key),
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/memberInfo/sendSms'
					});
				},
				verify:function(phoneNumber,vcode,sence){
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var phoneNumber = phoneNumber==undefined?'':phoneNumber;
					var sign = NirvanaUtil.toSign({"serviceName":"VALIDATE_SMS","smsScene":sence,"mobile":phoneNumber,"verify":vcode,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNumber,key),
							verify : NirvanaUtil.encrypt(vcode,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "VALIDATE_SMS",
							charset : "UTF-8",
							signType : "DES",
							smsScene : NirvanaUtil.encrypt(sence,key),
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/memberInfo/validateSms'
					});
				}
			};
		}]);


});
