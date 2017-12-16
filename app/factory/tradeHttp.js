define(['app'],function (app) {
	app
	//账单记录列表查询接口
		.factory('findBillListHttpService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
			return {
				findBillList:function(phoneNumber,status,index,smallIndex,size){
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var serviceName = "FIND_BILL_LIST";
					var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":phoneNumber,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							mobile : NirvanaUtil.encrypt(phoneNumber,key),
							status : NirvanaUtil.encrypt(status,key),
							appType : "001",
							platform : NirvanaUtil.encrypt("H5",key),
							index : index,
							smallIndex : smallIndex,
							size : size,
							serviceName : serviceName,
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/tradeQuery/findBillList'
					});
				},
				findBillDetail:function(businessNo,tradeType){
					var requestTime = NirvanaUtil.timestamp();
					var key = NirvanaUtil.md5(requestTime);//签名秘钥
					var serviceName = "FIND_BILL_DETAIL";
					var sign = NirvanaUtil.toSign({"serviceName":serviceName,"businessNo":businessNo,"tradeType":tradeType,"platform":"H5","requestTime":requestTime});
					return $http({
						method : 'POST',
						data : {
							businessNo : NirvanaUtil.encrypt(businessNo,key),
							tradeType : NirvanaUtil.encrypt(tradeType,key),
							platform : NirvanaUtil.encrypt("H5",key),
							serviceName : serviceName,
							charset : "UTF-8",
							signType : "DES",
							requestTime : requestTime,
							sign : sign
						},
						url : '/h5-wallet-nirvana/tradeQuery/findBillDetail'
					});
				}
			};
		}]);
});

