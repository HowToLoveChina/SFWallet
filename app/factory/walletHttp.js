
define(['require','app'],function (require,app) {
	app
		//充值
		.factory('appSyRechargeService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(
				authNo,password,amt,ccy,smsCode,verifyRef,bankSendSms) {
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"authNo":authNo,"password":password,"amt":amt,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : "APP_SY_RECHARGE",
						serviceVersion : "V1.0.0",
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						authNo : authNo,
						password  : NirvanaUtil.encrypt(password,key),
						amt : amt,
						ccy : ccy,
						smsCode : smsCode,
						verifyRef : verifyRef,
						isBankSendSms : bankSendSms
					},
					url :"h5-wallet-nirvana/appSyRecharge"
				});
			};
			return {
				appSyRecharge : function(authNo,password,amt,ccy,smsCode,verifyRef,bankSendSms) {
					return doRequest(authNo,password,amt,ccy,smsCode,verifyRef,bankSendSms);
				}
			};
		}])//提现
		.factory('withDrawService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(bankCardId,amt,password,remark) {
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"bankCardId":bankCardId,"amt":amt,"password":password,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : "APP_SY_WITHDRAW",
						serviceVersion : "V1.0.0",
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						bankCardId : bankCardId,
						amt : amt,
						password  : NirvanaUtil.encrypt(password,key),
						remark : remark,
					},
					url :"h5-wallet-nirvana/appSyWithDraw/withDraw"
				});
			};
			return {
				withDraw : function(bankCardId,amt,password,remark) {
					return doRequest(bankCardId,amt,password,remark);
				}
			};
		}])//顺手付钱包
		.factory('queryUserMoneyInfoService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(merchantId,openId,userId) {
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"serviceName":"QUERY_USER_MONEY_INFO","merchantId":merchantId,"openId":openId,"userId":userId,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : "QUERY_USER_MONEY_INFO",
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						merchantId : NirvanaUtil.encrypt(merchantId,key),
						openId : NirvanaUtil.encrypt(openId,key),
						userId  : NirvanaUtil.encrypt(userId,key)
					},
					url :"h5-wallet-nirvana/memberInfo/queryUserMoneyInfo"
				});
			};
			return {
				queryUserMoneyInfo : function(merchantId,openId,userId) {
					return doRequest(merchantId,openId,userId);
				}
			};
		}])//查询是否绑卡接口
		.factory('queryWhetherBindCardService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(mobile,cardType) {
				var serviceName = 'QUERY_WHETHER_BIND_CARD';
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":mobile,"platform":"H5","cardType":cardType,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : serviceName,
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						mobile : NirvanaUtil.encrypt(mobile,key),
						appType : "001",
						platform  : NirvanaUtil.encrypt('H5',key),
						cardType : NirvanaUtil.encrypt(cardType,key)
					},
					url :"h5-wallet-nirvana/bankQuery/queryWhetherBindCard"
				});
			};
			return {
				queryWhetherBindCard : function(mobile,cardType) {
					return doRequest(mobile,cardType);
				}
			};
		}])
		/*-----------------------------------------------------------------------------------*/
		//解除绑定银行卡接口（1027版本添加）
		.factory('unbindBankCardService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(signNo,password) {
				var serviceName = 'UNBIND_BANK_CARD';
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"serviceName":serviceName,"signNo":signNo,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : serviceName,
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						signNo : signNo,
						password : NirvanaUtil.encrypt(password,key)
					},
					url :"h5-wallet-nirvana/memBankCard/unbindBankCard"
				});
			};
			return {
				unbindBankCard : function(signNo,password) {
					return doRequest(signNo,password);
				}
			};
		}])
		/*--------------------------end---------------------------------------------------------*/
		/*-----------------------------------------------------------------------------------*/
		//检查支付是否需要银行发送短信（1129农行改造版本添加）
		.factory('checkPayBankSmsService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(amt,authNo) {
				var serviceName = 'CHECK_BANK_SMS';
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"amt":amt,"authNo":authNo,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : serviceName,
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : requestTime,
						amt : amt,
						authNo : authNo
					},
					url :"h5-wallet-nirvana/cashPay/checkPayBankSms"
				});
			};
			return {
				checkPayBankSms : function(password,authNo) {
					return doRequest(password,authNo);
				}
			};
		}])
		/*--------------------------end---------------------------------------------------------*/
		/*-------------------------申请授权token 1201风声红包接入使用----------------------------------------------------------*/
		.factory('applayTokenService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			var doRequest = function(signNo,password) {
				var serviceName = 'SY_MCH_OPEN_WALLET_REQ';
				var requestTime=NirvanaUtil.timestamp();
				var key = NirvanaUtil.md5(requestTime);
				var sign = NirvanaUtil.toSign({"serviceName":serviceName,"signNo":signNo,"requestTime":requestTime});
				return $http({
					method : 'POST',
					data : {
						serviceName : serviceName,
						serviceVersion : "V1.0.0",
						charset : "UTF-8",
						signType : "MD5",
						sign : sign,
						requestTime : NirvanaUtil.encrypt(requestTime,key)
					},
					url :"h5-wallet-nirvana/applayToken"
				});
			};
			return {
				applayToken : function() {
					return doRequest();
				}
			};
		}])
		//下载页面url
		.factory('downloadUrlService', ['$http', 'NirvanaUtil',
			function($http, NirvanaUtil) {
				return {
					get : function() {
						var serviceName = "H5_DOWNLOAD";
						var platform = 'H5';
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);//签名秘钥
						var sign = NirvanaUtil.toSign({"serviceName":serviceName, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								serviceName:serviceName,
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign
							},
							url : "h5-wallet-nirvana/H5Download/H5DownloadSwitch"
						});
					}
				};
			}]);
});


