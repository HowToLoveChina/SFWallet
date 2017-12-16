/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
//是否已经顺手付会员。
	app
		.factory('isRegistedService',['$rootScope', '$http', 'NirvanaUtil',function($rootScope, $http, NirvanaUtil){
			return {
				query : function(params) {
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥

					var userMobile = params.userMobile;
					var merchantId = params.merchantId;
					var businessCode = $rootScope.businessCode==undefined?'':$rootScope.businessCode;
					var userId = params.userId;
					var mobile = params.mobile;//
					var userName = params.userName;//可不传
					var sign = NirvanaUtil.toSign({"serviceName":"QUERY_MOBILE_INFO","mobile":mobile,"userMobile":userMobile,"merchantId":merchantId,"userId":userId, "platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							userMobile : NirvanaUtil.encrypt(userMobile,key),
							mobile:NirvanaUtil.encrypt(mobile,key),
							merchantId:NirvanaUtil.encrypt(merchantId,key),
							businessCode:businessCode,
							userId:NirvanaUtil.encrypt(userId,key),
							userName:NirvanaUtil.encrypt(userName,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "QUERY_MOBILE_INFO",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url : "h5-wallet-nirvana/memberInfo/queryMobileInfo"
					});
				}
			};
		}])
		//设置支付密码
		.factory('payPasswordService', ['$http', 'NirvanaUtil', function($http, NirvanaUtil) {
			return {
				set : function(phone, code ,oldPassword, newPassword,userName,idCard,cardType) {
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var sign = NirvanaUtil.toSign({"serviceName":"SET_PAY_PWD",'newPwd':newPassword,"mobile":phone,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							idCard : NirvanaUtil.encrypt(idCard,key),
							cardType : NirvanaUtil.encrypt(cardType,key),
							userName : NirvanaUtil.encrypt(userName,key),
							mobile : NirvanaUtil.encrypt(phone,key),
							oldPwd : NirvanaUtil.encrypt(oldPassword,key),
							newPwd : NirvanaUtil.encrypt(newPassword,key),
							verify : NirvanaUtil.encrypt(code,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "SET_PAY_PWD",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url :"h5-wallet-nirvana/memberInfo/setPayPwd"
					});
				}
			};
		}])
		//重置支付密码
		.factory('resetPayPwdService', ['$http', 'NirvanaUtil', function($http, NirvanaUtil) {
			return {
				set : function(phone, newPassword) {
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var sign = NirvanaUtil.toSign({"serviceName":"RESET_PAYPWD",'newPwd':newPassword,"mobile":phone,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phone,key),
							newPwd : NirvanaUtil.encrypt(newPassword,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "RESET_PAYPWD",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url :"h5-wallet-nirvana/memberInfo/resetPayPwd"
					});
				}
			};
		}])
		//设置支付密码+众包用户注册
		.factory('payPasswordRegisterService', ['$http', 'NirvanaUtil', function($http, NirvanaUtil) {
			return {
				set : function(phone, payPassword) {
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var sign = NirvanaUtil.toSign({"serviceName":"REGISTER_WALLET","mobile":phone,"payPwd":payPassword,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phone,key),
							payPwd : NirvanaUtil.encrypt(payPassword,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : "REGISTER_WALLET",
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url :"h5-wallet-nirvana/memberInfo/registerWallet"
					});
				}
			};
		}]);

});

