'use strict';
define(['app'],function (app) {
		app
		.filter('billionFormat',['$filter',function($filter){
			return function(input,param){
				input = input || 0;
				var str = '';
				if(param == '亿元'){
					str = $filter('number')(input/100000000,2);
				}else{
					str = $filter('number')(input,2);
				}
				return str;
			}
		}])
		.filter('subStrForStar', function () {//用*替换一些字符
			return function (input) {
				if (input == null || typeof(input) == "undefined"){
					return "";
				}
				if (input.length > 3) {
					var s = input.substring(0, 1);
					var e = input.substring(input.length - 1, input.length);
					return s + "****************" + e;
				} else if (input.length > 1) {
					return input.substring(0, 1) + "**";
				}
				return input;
			};
		})
		.filter('subStrForStar_phone', function () {//用*替换一些字符
			return function (input) {
				if (input == null || typeof(input) == "undefined"){
					return "";
				}
				if (input.length > 3) {
					var s = input.substring(0, 3);
					var e = input.substring(input.length - 4, input.length);
					return s + "*****" + e;
				}
				return input;
			};
		})
		.filter('subStrLast4', function () {//取银行卡后4位
			return function (input) {
				if (input == null || typeof(input) == "undefined"){
					return "";
				}
				if(input.length <= 4){
					return input;
				}
				var result = input.replace(/(^\s+)|(\s+$)/g,"");
				result = result.replace(/\s/g, "");
				return result.substr(-4);
			};
		})
		//代扣签约状态
		.filter('withholdStatus', function () {//取银行卡后4位
			return function (input) {
				if (input == null || typeof(input) == "undefined"){
					return "";
				}
				var status = input;
				var statusRes = '';
				switch(status){
					case 'INIT':
						statusRes = '待处理';
						break;
					case 'PROCESSING':
						statusRes = '进行中';
						break;
					case 'SIGNED':
						statusRes = '已签约';
						break;
					case 'CANCELLED':
						statusRes = '已解约';
						break;
					case 'FAILURE':
						statusRes= '失败';
						break;
				}
				return statusRes;
			};
		})
		//账户等级
		.filter('accountLevelFilter', function () {//取银行卡后4位
			return function (input) {
				if (input == null || typeof(input) == "undefined"){
					return "";
				}
				var status = input.toUpperCase();
				var statusRes = '';
				switch(status){
					case 'FIRST_LEVEL':
						statusRes = '初级';
						break;
					case 'SECOND_LEVEL':
						statusRes = '中级';
						break;
					case 'THREE_LEVEL':
						statusRes = '高级';
						break;
					case 'FOUR_LEVEL':
						statusRes = '高级';
						break;
					case 'FIVE_LEVEL':
						statusRes = '高级';
						break;
				}
				return statusRes;
			};
		})
		//交易记录列表 日期格式化
		.filter('tradeTimeFunc', function () {//取银行卡后4位
			return function (input) {
				var newInput = input.slice(5,16);
				var today = new Date();
				var thisMonth = today.getMonth()+1,
					thisDay = today.getDate(),
					prevDay = thisDay-1;
				if(newInput.slice(0,2) == thisMonth){
					if(newInput.slice(3,5) == thisDay){
						newInput = "今天" + newInput.slice(5);
					}else if(newInput.slice(3,5) == prevDay){
						newInput = "昨天" + newInput.slice(5);
					}
				}
				return newInput;
			};
		})
		.filter('AvaBalance', function () {//可用余额格式化(单位是分)
			return function (input) {
				if (input == null || typeof(input) == "undefined") {
					return "";
				}
				var input = parseFloat(input/100).toFixed(2);
				var toprice = 10000;// 10000元

				if (input < toprice) {
					return input;
				} else {
					return (input / toprice).toFixed(2) + "万";
				}
			};
		})
		.filter('AvailableQuota', function () {//可用余额格式化(单位是元)
			return function (input) {
				if (input == null || typeof(input) == "undefined") {
					return "";
				}
				var input = parseFloat(input).toFixed(2);
				var toprice = 10000;// 10000元

				if (input < toprice) {
					return input;
				} else {
					return (input / toprice).toFixed(2) + "万";
				}
			};
		})
		.filter('AvailableQuota2', function () {//可用余额格式化(单位是分)
			return function (input) {
				if (input == null || typeof(input) == "undefined") {
					return "";
				}
				if(!input){
					return "不足";
				}
				var input = parseFloat(input/100).toFixed(2);
				var toprice = 10000;// 10000元

				if (input < toprice) {
					return input + "元";
				} else {
					return (input / toprice).toFixed(2) + "万元";
				}
			};
		});
});
