/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {

	/* 数字格式化 
	 参数说明：
	 num(要格式化的数字)

	 返回：
	 保留两位小数的数字（String类型）

	 */

	app.factory('FormatNum',['$log',function($log){
		return{
			formate:function(num){
				if(num==''||num==undefined||num==null){
					$log.warn('参数错误，请输入数字进行格式化！');
					return num;
				}
				if(typeof num == 'number'){
					return num.toFixed(2);
				}else if(typeof num =='string'){
					var newNum = parseFloat(num);
					return newNum.toFixed(2);
				}else{
					$log.warn('参数错误，请输入数字进行格式化！');
					return num;
				}
			},
			//金额格式化
			fn_money:function(money){
				var formatConfig = {
					num: 2,				//保留小数后2位
					unit: "fen",		//金额单位["yuan","jiao","fen"]
					unit_sign: false 	//是否带“￥”符号
				};

				if(!money || money==""){
					return "";
				}

				//金额单位转换
				switch(formatConfig.unit){
					case "fen":
						money = money/100;
						break;
					case "jiao":
						money = money/10;
						break;
					case "yuan":
						break;
					default:
						money = money/100;
				}
				return money.toFixed(2);
			},
			/**
			 * [countNum js计算乘除法]
			 * @param  {[number]} fNum   [第一个数]
			 * @param  {[number]} sNum   [第二个数]
			 * @param  {[string]} symbol [符号]
			 * @param  {[number]} digit  [保留小数位数]
			 * @return {[number]}        [计算结果]
			 */		countNum:function(fNum,sNum,symbol,digit){
				var decimal = 1;
				var lastValue = 0;
				function getNum(num){
					var strNum = num.toString();
					if(strNum.indexOf('.')!=-1){
						var arrNum = strNum.split('.');
						decimal *= Math.pow(10,arrNum[1].length*1);
						return strNum.replace('.','')*1;
					}else{
						return num;
					}
				};
				if(typeof fNum!='number'||typeof sNum!='number'){
					// console.log('请输入数字进行计算！');
					return;
				}
				var fNew = getNum(fNum);
				var sNew = getNum(sNum);
				if(symbol=='*'){
					lastValue = (fNew*sNew)/decimal;
				}else if(symbol=='/'){
					var tNew = getNum(fNew/sNew);
					lastValue = tNew/decimal;
				}
				if(digit&&(typeof digit=='number')){
					lastValue = lastValue.toFixed(digit)*1;
				}
				return lastValue;
			}
		}

	}]);

});

