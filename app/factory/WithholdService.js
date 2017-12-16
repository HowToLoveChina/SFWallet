/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {

	app
	//包含开通代扣服务的绑卡(绑卡与代扣签约)
	/**
	 业务代码	businessCode	String	是	业务代码，用于组成新的场景码，新的场景码格式如下：merchantId+ businessCode+产品编码(代扣签约是251，不用传递)
	 场景码	sceneCode	String	否	场景码，该字段是为了兼容老的场景码，新结构的场景码如果传递了merchantId和businessCode，则不用传递该字段
	 代扣协议号	contractNo	String	否	代扣协议号，如果是存放在session里面，则可以不用传递，从session里面获取该字段，目前众包就是这样获取
	 结果通知url	notifyUrl	String	是	代扣签约结果通知url，如果有会员绑定，则传递的是会员绑定的结果通知url，代扣签约信息(协议号)一起通知给商户，不用再另行通知
	 **/
		.factory('bankCardWithholdSignService', ['$http', 'NirvanaUtil','$rootScope',
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
						var certStartTime = (params.startDate=='undefined'||params.startDate==null)?'':params.startDate;
						var certEndTime = (params.endDate=='undefined'||params.endDate==null)?'':params.endDate;
						var country = params.country;
						var province = (params.province=='undefined'||params.province==null)?'':params.province;
						var city = (params.city=='undefined'||params.city==null)?'':params.city;
						var areaCounty = (params.areaCounty=='undefined'||params.areaCounty==null)?'':params.areaCounty;
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
						var sign = NirvanaUtil.toSign({"serviceName":"BIND_CARD_AND_SIGN","cardNo":cardNo,"bankCode":bankCode,"smsMode":smsMode,"isFront":isFront, "requestTime":requestTime});
						var key = NirvanaUtil.md5(requestTime);//签名秘钥

						var _data = {
							serviceName:"BIND_CARD_AND_SIGN",
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
							mobile : NirvanaUtil.encrypt(mobile, key),
							userMobile : NirvanaUtil.encrypt($rootScope.userMobile,key),
							merchantId : NirvanaUtil.encrypt($rootScope.merchantId,key),
							userId : NirvanaUtil.encrypt($rootScope.userId,key),
							userName : $rootScope.userName,
							businessCode:$rootScope.businessCode,
							sceneCode:'',
							contractNo:$rootScope.contractNo,
							notifyUrl:$rootScope.notifyUrl,
							payType:$rootScope.contractType
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
							url : "h5-wallet-nirvana/bankCard/bindCardAndSign"
						});
					}
				};
			}])
		//专门用于代扣签约查询顺手付支付方式列表
		//merchantId:商户号，新的场景码组成如下：商户号+业务代码+产品编码
		//businessCode:业务代码，新的场景码组成如下：商户号+业务代码+产品编码
		.factory('payListForWithholdService', ['$rootScope', '$http', 'NirvanaUtil',
			function($rootScope, $http,NirvanaUtil) {
				return {
					query : function() {
						var tradeScene = '';
						var requestTime=NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);
						var serviceName = 'PAYMENT_LIST';
						var sign=NirvanaUtil.toSign({"serviceName":serviceName,"tradeScene":tradeScene,"requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								tradeScene:'',
								merchantId:$rootScope.merchantId,
								businessCode:$rootScope.businessCode,
								serviceName:serviceName,
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign
							},
							url :  "h5-wallet-nirvana/cashPay/queryPayListForWithhold"
						});
					}
				};
			}])
		//代扣签约(第四个流程：会员已经实名，进入到代扣签约界面下一步)
		/**
		 业务代码	businessCode	String	是	业务代码，用于组成新的场景码，新的场景码格式如下：merchantId+ businessCode+产品编码(代扣签约是251，不用传递)
		 场景码	tradeScene	String	否	场景码，该字段是为了兼容老的场景码，新结构的场景码如果传递了merchantId和businessCode，则不用传递该字段
		 代扣协议号	contractNo	String	否	代扣协议号，如果是存放在session里面，则可以不用传递，从session里面获取该字段，目前众包就是这样获取
		 结果通知url	notifyUrl	String	是	代扣签约结果通知url，如果有会员绑定，则传递的是会员绑定的结果通知url，代扣签约信息(协议号)一起通知给商户，不用再另行通知
		 银行预留手机号	mobile	String	否	银行预留手机号，如果传值了，代表一定是用户输入的，必须验证短信验证码。
		 短信验证码	smsCode	String	否	对预留手机号进行验证的验证码
		 支付密码	password	String	是	支付密码
		 **/
		.factory('withholdService', ['$rootScope', '$http','NirvanaUtil',
			function($rootScope, $http, NirvanaUtil) {
				return {
					sign : function(params) {
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);

						var userMobile = $rootScope.userMobile==undefined?'':$rootScope.userMobile;
						var merchantId = $rootScope.merchantId==undefined?'':$rootScope.merchantId;
						var userId = $rootScope.userId==undefined?'':$rootScope.userId;
						var userName = $rootScope.userName==undefined?'':$rootScope.userName;
						var cardNo = params.cardNo;
						var cardType = params.cardType;
						var bankCode = params.bankCode;
						var bankName = params.bankName;
						var mobile = params.mobile==undefined?'':params.mobile;
						var smsCode = params.smsCode==undefined?'':params.smsCode;
						var password = params.password==undefined?'':params.password;
						var payType = $rootScope.contractType==undefined?'':$rootScope.contractType;
						var signNo = params.signNo;
						var businessCode = $rootScope.businessCode==undefined?'':$rootScope.businessCode;
						var sign = NirvanaUtil.toSign({"serviceName":"WITHHOLD_SIGN", "userMobile":userMobile, "merchantId":merchantId, "userId":userId, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								userMobile:NirvanaUtil.encrypt(userMobile, key),
								merchantId:NirvanaUtil.encrypt(merchantId, key),
								userId:NirvanaUtil.encrypt(userId, key),
								userName:userName,
								cardNo:NirvanaUtil.encrypt(cardNo, key),
								cardType:NirvanaUtil.encrypt(cardType, key),
								bankCode:NirvanaUtil.encrypt(bankCode, key),
								bankName:NirvanaUtil.encrypt(bankName, key),
								businessCode:businessCode,
								tradeScene:'',
								contractNo:$rootScope.contractNo,
								notifyUrl:$rootScope.notifyUrl,
								mobile:mobile,//银行预留手机号
								smsCode:NirvanaUtil.encrypt(smsCode, key),
								password:NirvanaUtil.encrypt(password, key),//支付密码
								signNo:signNo,
								type:params.type,
								platform:NirvanaUtil.encrypt("H5", key),
								serviceName:"WITHHOLD_SIGN",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign,
								payType:payType
							},
							url : "h5-wallet-nirvana/bankCard/withholdSign"
						});
					}
				};
			}])
		//前端银行页面绑卡完成代扣签约
		.factory('frontWithholdService', ['$rootScope', '$http','NirvanaUtil',
			function($rootScope, $http, NirvanaUtil) {
				return {
					sign : function(params) {
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);

						var userMobile = params.userMobile;
						var merchantId = params.merchantId;
						var userId = params.userId;
						var userName = params.userName;
						var cardNo = params.cardNo;
						var cardType = params.cardType;
						var bankCode = params.bankCode;
						var bankName = params.bankName;
						var signNo = params.signNo;
						var payType = $rootScope.contractType==undefined?'':$rootScope.contractType;
						var sign = NirvanaUtil.toSign({"serviceName":"WITHHOLD_SIGN", "userMobile":userMobile, "merchantId":merchantId, "userId":userId, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								userMobile:NirvanaUtil.encrypt(userMobile, key),
								merchantId:NirvanaUtil.encrypt(merchantId, key),
								userId:NirvanaUtil.encrypt(userId, key),
								userName:userName,
								cardNo:NirvanaUtil.encrypt(cardNo, key),
								cardType:NirvanaUtil.encrypt(cardType, key),
								bankCode:NirvanaUtil.encrypt(bankCode, key),
								bankName:NirvanaUtil.encrypt(bankName, key),
								businessCode:$rootScope.businessCode,
								tradeScene:'',
								contractNo:$rootScope.contractNo,
								notifyUrl:$rootScope.notifyUrl,
								signNo:signNo,
								type:params.type,
								platform:NirvanaUtil.encrypt("H5", key),
								serviceName:"WITHHOLD_SIGN",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign,
								payType:payType
							},
							url : "h5-wallet-nirvana/bankCard/frontWithholdSign"
						});
					}
				};
			}])
		
		//代扣签约银行卡切换接口
		/**
		 *contractNo:代扣协议号
		 *authNo:切换后的签约号，可能是快捷签约号，也可能是委收签约号
		 *type:委收还是快捷，QUICK--快捷  WITHHOLDING--委收
		 *password:支付密码
		 *返回参数：是否成功	isSuccess	字符MAX(1)	Y：成功
		 **/
		.factory('WithholdBankCard', ['$rootScope', '$http','NirvanaUtil',
			function($rootScope, $http, NirvanaUtil) {
				return {
					switch : function(contractNo, authNo, type, password) {
						var requestTime = NirvanaUtil.timestamp();
						var key = NirvanaUtil.md5(requestTime);
						var mobile = $rootScope.setMobile_phoneNumber==undefined ? "": $rootScope.setMobile_phoneNumber;
						var smsCode = $rootScope.setMobile_validCode==undefined ? "" : $rootScope.setMobile_validCode;

						var sign = NirvanaUtil.toSign({"authNo":authNo, "contractNo":contractNo, "type":type, "requestTime":requestTime});
						return $http({
							method : 'POST',
							data : {
								contractNo:contractNo,
								authNo:authNo,
								type:type,
								mobile:mobile,//银行预留手机号
								smsCode:NirvanaUtil.encrypt(smsCode, key),
								password:NirvanaUtil.encrypt(password, key),//支付密码
								platform:NirvanaUtil.encrypt("H5", key),
								serviceName:"WITHHOLD_SWITH_CARD",
								charset:"UTF-8",
								signType:"MD5",
								requestTime:requestTime,
								sign:sign
							},
							url : "h5-wallet-nirvana/withholding/switchBankCard"
						});
					}
				};
			}]);
});