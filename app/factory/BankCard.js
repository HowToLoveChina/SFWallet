/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {

	app
	
		/**
		 商户号	merchantId	字符串	否	商户号 新结构下的场景码=merchantId+businessCode+productCode
		 业务代码	businessCode	字符串	否	业务代码，需要商户传递，由顺手付分配，新结构下的场景码=merchantId+businessCode+productCode
		 产品编码	productCode	字符串	否	产品编码
		 场景码	tradeScene	字符串	否	场景码，如果是没有商户号的场景码，可以直接传递进该字段里
		 **/
		.factory('queryBankListService', ['$rootScope', '$http','NirvanaUtil', 'StorageDataService', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY',
			function($rootScope, $http, NirvanaUtil, StorageDataService, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW, TRADESCENE_PAY) {
				return {
					query : function(isRealName) {
						var requestTime = NirvanaUtil.timestamp();
						var sign = NirvanaUtil.toSign({"serviceName":"BANK_LIST","requestTime":requestTime});
						var contractType = $rootScope.contractType==undefined?'':$rootScope.contractType;
						var productCode = '';
						if(contractType != 'BALANCE'){
							productCode = '251';
						}
						var tradeScene = '';
						var code = StorageDataService.getParam('toAddBankCode');
						if(code == 1){//充值
							tradeScene = TRADESCENE_RECHARGE;
							productCode = '';
						}else if(code == 2){//提现
							tradeScene = TRADESCENE_WITHDRAW;
							productCode = '';
						}else if(code == 99){//绑定
							tradeScene = $rootScope.merchantId+'9999999';
							productCode = '';
						}else if(code == 3 || code == 4 || code == 5 || code == 8){//缴纳保证金、支付货款
							tradeScene = TRADESCENE_PAY;
							productCode = '';
						}
						var businessCode = $rootScope.businessCode==undefined?'':$rootScope.businessCode;
						return $http({
							method : 'POST',
							data : {
								merchantId:$rootScope.merchantId,
								businessCode:businessCode,
								productCode:productCode,
								tradeScene:tradeScene,
								withholdPayType:contractType,
								isRealName:isRealName,
								serviceName:"BANK_LIST",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign
							},
							url : "h5-wallet-nirvana/bankCard/queryBankList"
						});
					}
				};
			}])
		//不包含开通代扣服务的绑卡
		.factory('bankCardSignService', ['$http', 'NirvanaUtil','$rootScope',
			function($http, NirvanaUtil,$rootScope) {
				return {
					sign : function(params, dynamicFields, mobile, smsCode, verifyRef) {
						//银行卡号
						var cardNo = params.bankcardNumber;
						if (cardNo != null) {
							cardNo = cardNo.replace(/[ ]/g, "");
						}
						var certType = params.certType.code;//证件类型-身份证
						var certNo = params.certNumber;//身份证号
						certNo = certNo.replace(/[ ]/g, "");
						var sex = "";
						var sexFlag = certNo.substr(16, 1);
						if(sexFlag % 2 == 0){
							sex = "F";
						}else{
							sex = "M";
						}
						//新增的身份信息字段
						var certStartTime = (params.startDate==null||params.startDate=='undefined')?'':params.startDate;
						var certEndTime = (params.endDate==null||params.endDate=='undefined')?'':params.endDate;
						var country = params.country;
						var province = (params.province==null||params.province=='undefined')?'':params.province;
						var city = (params.city==null||params.city=='undefined')?'':params.city;
						var areaCounty = (params.areaCounty==null||params.areaCounty=='undefined')?'':params.areaCounty;
						var occupation = params.staff;//职业
						var address = params.detailAddress;

						var bankCode = params.bankModel.bankCode;
						var bankName = params.bankModel.bankName;
						var cardType = params.bankModel.cardType;
						var smsMode = params.bankModel.smsMode+'';
						var isFront = params.bankModel.isFront;

						var smsCode = (smsCode == null)?"":(smsCode + "");//用户输入的手机号验证码
						var verifyRef = (verifyRef == null)?"":(verifyRef + "");//系统返回的验证码
						var requestTime = NirvanaUtil.timestamp();
						var sign = NirvanaUtil.toSign({"serviceName":"SIGN","cardNo":cardNo,"bankCode":bankCode,"smsMode":smsMode,"isFront":isFront, "requestTime":requestTime});
						var key = NirvanaUtil.md5(requestTime);//签名秘钥


						var _data = {
							serviceName:"SIGN",
							charset:"UTF-8",
							signType:"MD5",
							requestTime:requestTime,
							sign:sign,
							cardNo : NirvanaUtil.encrypt(cardNo, key),
							cardType : NirvanaUtil.encrypt(cardType, key),
							certNo : NirvanaUtil.encrypt(certNo, key),
							certType : NirvanaUtil.encrypt(certType, key),
							cardHost : params.userName,
							dynamicFields : NirvanaUtil.encrypt(dynamicFields, key),
							bankCode : NirvanaUtil.encrypt(bankCode, key),
							bankName : NirvanaUtil.encrypt(bankName, key),
							smsCode : NirvanaUtil.encrypt(smsCode, key),
							smsMode : NirvanaUtil.encrypt(smsMode, key),
							verifyRef:NirvanaUtil.encrypt(verifyRef, key),
							isFront : NirvanaUtil.encrypt(isFront, key),
							mobile : NirvanaUtil.encrypt(mobile, key)
						};
						if(sessionStorage.certExtFlag == 'Y'){//人行反洗钱字段
							_data.certStartTime = certStartTime;
							_data.certEndTime = certEndTime;
							_data.country = country;
							_data.province = province;
							_data.city = city;
							_data.areaCounty = areaCounty;
							_data.sex = sex;
							_data.occupation = occupation;
							_data.address = address;
						}

						return $http({
							method : 'POST',
							data : _data,
							url : "h5-wallet-nirvana/bankCard/sign"
						});
					}
				};
			}])

		.factory('validatePWDService', ['$http','NirvanaUtil',
			function($http, NirvanaUtil) {
				return {
					valid : function(mobile, payPwd) {
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);
						var sign = NirvanaUtil.toSign({"serviceName":"VALIDATE_PAY_PASSWORD", "mobile":mobile, "payPwd":payPwd, "platform":"H5", "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								mobile:NirvanaUtil.encrypt(mobile, key),
								payPwd:NirvanaUtil.encrypt(payPwd, key),
								platform:NirvanaUtil.encrypt("H5", key),

								serviceName:"VALIDATE_PAY_PASSWORD",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign
							},
							url : "h5-wallet-nirvana/memberInfo/validatePayPassWord"
						});
					}
				};
			}])
		.factory('sendSignSmsService', ['$http','NirvanaUtil',
			function($http, NirvanaUtil) {
				return {
					send : function(params, dynamicFields, mobile) {
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);

						var cardNo = params.bankcardNumber;
						var cardType = params.bankModel.cardType;
						var certNo = params.certNumber;
						var certType = params.certType.code;
						var cardHost = params.userName;
						var dynamicFields = dynamicFields;
						var bankCode = params.bankModel.bankCode;
						var bankName = params.bankModel.bankName;
						var smsMode = params.bankModel.smsMode+'';
						var isFront = params.bankModel.isFront;
						var mobile = mobile;
						var sign = NirvanaUtil.toSign({"serviceName":"PRE_SIGN","bankCode":bankCode,"cardNo":cardNo,"smsMode":smsMode,"isFront":isFront,"mobile":mobile,"requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								serviceName : "PRE_SIGN",
								charset : "UTF-8",
								signType : "MD5",
								requestTime : requestTime,
								sign : sign,
								cardNo : NirvanaUtil.encrypt(cardNo, key),
								cardType : NirvanaUtil.encrypt(cardType, key),
								certNo : NirvanaUtil.encrypt(certNo, key),
								certType : NirvanaUtil.encrypt(certType, key),
								cardHost : NirvanaUtil.encrypt(cardHost, key),
								dynamicFields : NirvanaUtil.encrypt(dynamicFields, key),
								bankCode : NirvanaUtil.encrypt(bankCode, key),
								bankName : NirvanaUtil.encrypt(bankName, key),
								smsMode : NirvanaUtil.encrypt(smsMode, key),
								isFront : NirvanaUtil.encrypt(isFront, key),
								mobile : NirvanaUtil.encrypt(mobile, key)
							},
							url : "h5-wallet-nirvana/bankCard/sendSignSms"
						});
					}
				};
			}])

		//银行卡信息查询(识别银行卡)
		.factory('bankCardQueryService', ['$rootScope', '$http', 'NirvanaUtil', 'StorageDataService', 'TRADESCENE_RECHARGE', 'TRADESCENE_WITHDRAW', 'TRADESCENE_PAY',
			function($rootScope, $http, NirvanaUtil, StorageDataService, TRADESCENE_RECHARGE, TRADESCENE_WITHDRAW, TRADESCENE_PAY) {
				return {
					query : function(cardNo, isRealName) {
						var cardNum = cardNo.replace(/[ ]/g, "");
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);//	签名秘钥
						var contractType = $rootScope.contractType==undefined?'':$rootScope.contractType;
						var productCode = '';
						if(contractType != 'BALANCE'){
							productCode = '251';
						}
						var tradeScene = '';
						var code = StorageDataService.getParam('toAddBankCode');
						if(code == 1){//充值
							tradeScene = TRADESCENE_RECHARGE;
							productCode = '';
						}else if(code == 2){//提现
							tradeScene = TRADESCENE_WITHDRAW;
							productCode = '';
						}else if(code == 99){//绑定
							tradeScene = $rootScope.merchantId+'9999999';
							productCode = '';
						}else if(code == 3 || code == 4 || code == 5 || code == 8){//缴纳保证金、支付货款
							tradeScene = TRADESCENE_PAY;
							productCode = '';
						}
						var sign = NirvanaUtil.toSign({"serviceName":"BANK_LIST_QUERY","cardNo":cardNum,"isRealName":isRealName,"requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								merchantId:$rootScope.merchantId,
								businessCode:$rootScope.businessCode,
								productCode:productCode,
								tradeScene:tradeScene,
								withholdPayType:contractType,
								serviceName : "BANK_LIST_QUERY",
								charset : "UTF-8",
								signType : "MD5",
								requestTime : requestTime,
								sign : sign,
								cardNo : NirvanaUtil.encrypt(cardNum, key),
								isRealName : NirvanaUtil.encrypt(isRealName, key)
							},
							url : "h5-wallet-nirvana/bankCard/cardQuery"
						});
					}
				};
			}])
		.factory('queryBindCardStatusService', ['$http', 'NirvanaUtil',
			function($http, NirvanaUtil) {
				return {
					query : function(cardNo, bankCode, cardType) {
						if (cardNo != null) {
							cardNo = cardNo.replace(/[ ]/g, "");
						}
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);//签名秘钥
						var sign = NirvanaUtil.toSign({"cardNo":cardNo, "bankCode":bankCode, "cardType":cardType, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								serviceName:"QUERY_BIND_STATUS",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign,
								cardNo : NirvanaUtil.encrypt(cardNo, key),
								bankCode : NirvanaUtil.encrypt(bankCode, key),
								cardType : NirvanaUtil.encrypt(cardType, key)
							},
							url : "h5-wallet-nirvana/bankCard/queryBindCardStatus"
						});
					}
				};
			}])
		//校验身份证是否被占用
		.factory('validateCertExistsService', ['$http', 'NirvanaUtil',
			function($http, NirvanaUtil) {
				return {
					query : function(certNo, certType) {
						var serviceName = "VALIDATE_CERT_EXISTS";
						var platform = 'H5';
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);//签名秘钥
						var sign = NirvanaUtil.toSign({"serviceName":serviceName,"certNo":certNo, "certType":certType,"platform":platform, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								serviceName:serviceName,
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign,
								certNo : NirvanaUtil.encrypt(certNo, key),
								certType : NirvanaUtil.encrypt(certType, key),
								platform : NirvanaUtil.encrypt(platform, key)
							},
							url : "h5-wallet-nirvana/bankCard/validateCertExists"
						});
					}
				};
			}])
	;




});