/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
	app
		.factory('findPayPwdService', ['$http','NirvanaUtil',function($http,NirvanaUtil){
			return {
				checkUserRegisterStatus:function (phoneNum) {
					// body...
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);
					var sign = NirvanaUtil.toSign({"serviceName":"QUERY_USER_REGISTER","mobile":phoneNum,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNum,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "QUERY_USER_REGISTER",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url :"/h5-wallet-nirvana/memberInfo/queryUserRegister"
					});
				},
				checkeRealNameStatus:function(phoneNum) {
					// body...
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var sign = NirvanaUtil.toSign({"serviceName":"QUERY_CERTTYPE_INFO","mobile":phoneNum,"platform":"H5","requestTime":requestTime});//
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNum,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "QUERY_CERTTYPE_INFO",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/memberInfo/queryCertTypeInfo'
					});
				},
				validateUserInfo:function(phoneNum,userName,idCardNo,idCardType) {
					// body...
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var sign = NirvanaUtil.toSign({"serviceName":"CHECK_NAMEID_RESETPAYPWD","idCard":idCardNo,"mobile":phoneNum,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNum,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							userName : userName,
							idCard : NirvanaUtil.encrypt(idCardNo,key),
							cardType : idCardType,
							serviceName : "CHECK_NAMEID_RESETPAYPWD",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/memberInfo/checkNameIdResetPaypwd'
					});
				}
			};
		}])

});