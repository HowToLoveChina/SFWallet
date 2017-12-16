
define( function (require) {
	var app=require("../app");
	require("../factory/WithholdService");
	require("../factory/BankCard");
	require("../factory/pageSlide");
	require("filter");
	require("../directive/directive");

	/*
	 开通顺手付代扣服务(hash:withholding)
	 */
	app
		.controller('WithHoldingCtrl', ['$scope','$state', '$rootScope', 'NirvanaUtil', 'pageSlide', 
			'payListForWithholdService', 'StorageDataService', 'queryWithholdType', 'queryBankListService', 'Toast', function($scope,$state, $rootScope, NirvanaUtil, pageSlide, payListForWithholdService, StorageDataService, queryWithholdType, queryBankListService, Toast){
			$scope.goBack = function(){
				if(NirvanaUtil.browser().ios){//兼容ios关闭界面
					window.location.href="doBackSchmel://sfpay.com";
				}else{
					NirvanaUtil.doBack(0);
				}
			};
			window.doKeyBack = function(){
				if ($scope.showBankcardList || $scope.supportBankList) {//open
					$scope.cancel1();
					$scope.cancel2();
					$scope.$apply();
				} else {//close
					$scope.goBack();
				}
			};
			//响应android物理返回键(顺手付)
			window.onBack = function(){
				window.doKeyBack();
			};
			$scope.obj = {
				accept:true
			};
			//代扣帐号
			$scope.accountNumber = StorageDataService.getBindDateByKey('phoneNumber');

			$scope.commercialName = "深圳市顺丰益众信息技术有限公司";//商户名
			$scope.withholdContent = "在同城配平台抢单所产生的应交货款，将通过顺手付代扣服务自动扣款。";//代扣内容
			//选择付款方式（储蓄银行卡列表）
			$scope.selectDebitBankcard = function(){
				if($scope.isBalance) return;
				$scope.showBankcardList = true;
			};
			//关闭层
			$scope.cancel1 = function () {
				$scope.showBankcardList = false;
			};
			//选择一张储蓄卡
			$scope.bankModel;
			$scope.selectedDebitBank = function(index){
				$scope.iconSelected = index;
				$scope.bankModel = $scope.banklist[index];
				$scope.cancel1();
				if(!hasBankMobile()){
					$rootScope.params_setMobile = {
						'bankModel':$scope.bankModel, 'withhodFlag':'open'
					}
					$state.go('setMobile');
				}
			};
			$scope.iconSelected = 0;//默认第一张银行卡选中
			//判断是否有银行预留手机号
			function hasBankMobile(){
				if($scope.bankModel.bankMobile == null || $scope.bankModel.bankMobile == ''){//假如没有预留银行手机号
					return false;
				}
				return true;
			}

			//使用新银行卡(从代扣进入添卡)
			$scope.addBankCard = function(){
				$rootScope.openedBankListAtOpen = true;
				NirvanaUtil.clearAddBankCardCache();
				$rootScope.sceneCode = '';
				StorageDataService.setParam('toAddBankCode', 7);
				$rootScope.notWithholdSign = 'Y';
				$state.go('bankcardAdd');//添卡时开通代扣
			};

			var withholdType = queryWithholdType;
			if (withholdType.data.rltCode == '00' && withholdType.data.data) {
				var withholdTypeResult = NirvanaUtil.decryptRespone(withholdType.data.data,withholdType.data.responseTime);
				$rootScope.contractType = withholdTypeResult.contractType;//扣款类型，BALANCE：余额 BANKCARD：银行卡 ALL：余额和银行卡
				if($rootScope.contractType == 'BALANCE'){//余额代扣，屏蔽银行卡
					$scope.isBalance = true;//是否只支持余额代扣
				}else{
					$scope.isBalance = false;
				}
			} else {
				Toast.show(withholdType.data.rltMsg);
			}

			$scope.banklist = [];

			$rootScope.loading = true;
			payListForWithholdService.query()
				.success(function (response) {
					$rootScope.loading = false;
					if (response.rltCode == 00) {
						var data_new = NirvanaUtil.decryptRespone(response.data, response.responseTime);
						var paylist = data_new.paymentList;
						if (paylist == null || paylist.length <= 0) {
							return;
						}
						//type:代表支付类型，取值：QUICK或者WITHHOLDING
						$scope.banklist = [];
						if ($scope.isBalance) {//只支持余额代扣，屏蔽银行卡
							for (var i = 0; i < paylist.length; i++) {
								if (paylist[i].cardType != "DEBIT" && paylist[i].cardType != 'CREDIT') {
									$scope.banklist.push(paylist[i]);
								}
							}
						} else {//有余额，和银行卡
							for (var i = 0; i < paylist.length; i++) {
								if (paylist[i].type == 'BALANCE') {
									continue;
								} else {
									$scope.banklist.push(paylist[i]);
								}
							}
						}
						$scope.bankModel = $scope.banklist[0];
					} else {
						Toast.show(response.rltMsg);
					}
				}).error(function (response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			//下一步，输入支付密码
			$scope.next = function(){
				if($scope.bankModel == null){
					Toast.show("请选择付款方式！");
					return;
				}
				if(!hasBankMobile() && ($scope.bankModel.cardType == "DEBIT" || $scope.bankModel.cardType == 'CREDIT')){
					$rootScope.params_setMobile = {
						'bankModel':$scope.bankModel, 'withhodFlag':'open'
					}
					$state.go('setMobile');
					return;
				}
				StorageDataService.setWthholdData('bankModel', $scope.bankModel);
				StorageDataService.setWthholdData('withhodFlag', 'open');
				$state.go('withholdInputPayPwd');//open表示开通代扣,change表示更换代扣银行卡
			};
			//查看代扣协议
			$scope.openProtocal = function(){
				$state.go('withholdProtocal');
			};
			if($rootScope.openedBankListAtOpen){
				$scope.selectDebitBankcard();
			}

			//支持的银行列表(不可选择)
			//储蓄卡
			$scope.debits2 = [];
			//信用卡
			$scope.credits2 = [];
			//(仅供查看列表)不可选择
			function getSupportBankList(){
				if($scope.debits2.length > 0){
					return;
				}
				var isRealName = "Y";
				//$rootScope.loading = true;
				queryBankListService.query(isRealName).
				success(function(response) {
					$rootScope.loading = false;
					if (response.rltCode == '00' && response.data) {
						var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
						$scope.debits2 = res.debits;
						$scope.credits2 = res.credits;
						$scope.supportBankLists = $scope.debits2;
					}else{
						Toast.show(response.rltMsg);
					}
				}).
				error(function(response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			}

			//查看支持的银行卡列表（不可选择）
			$scope.supportBankCard = function(){
				getSupportBankList();
				$scope.supportBankList = true;
				$scope.debitCardListShow = true;//默认显示储蓄卡
			};
			//关闭层
			$scope.cancel2 = function () {
				$scope.supportBankList = false;
			};
			//储蓄卡和信用卡Tab active显示
			$scope.debitCardListTabActive = true;
			$scope.showDebitCardList = function() {
				$scope.debitCardListTabActive = true;
				$scope.supportBankLists = $scope.debits2;
			};
			$scope.showCreditCardList = function() {
				$scope.debitCardListTabActive = false;
				$scope.supportBankLists = $scope.credits2;
			};
		}])
		//hash:withholdingSwitch 更换代扣银行卡
		.controller('WithHoldingChangeCtrl', ['$scope','$state', '$rootScope', '$timeout', 'NirvanaUtil', 'pageSlide',
			'payListForWithholdService', 'StorageDataService', 'queryBankListService', 'withholdDetail','WithholdType', 'URLParseService', 'Toast', function($scope,$state, $rootScope, $timeout, NirvanaUtil, pageSlide, payListForWithholdService, StorageDataService, queryBankListService, withholdDetail, WithholdType,URLParseService,Toast){
			$scope.goBack = function(){
				if ($rootScope.sourceType == 'SFFIX') {//顺维修接入
					window.location.href = $rootScope.forwardUrl;
				} else {
					if (NirvanaUtil.browser().ios) {//兼容ios关闭界面
						window.location.href = "doBackSchmel://sfpay.com";
					} else {
						NirvanaUtil.doBack(0);
					}
				}
			};
			$scope.finishGo = function(){
				if ($rootScope.sourceType == 'SFFIX') {//顺维修接入
					window.location.href = $rootScope.forwardUrl;
				} else {
					if (NirvanaUtil.browser().ios) {//兼容ios关闭界面
						window.location.href = "doBackSchmel://sfpay.com";
					} else {
						NirvanaUtil.doBack(0);
					}
				}
			};
			//响应android物理返回键(众包)
			window.doKeyBack = function () {
				if ($scope.showPayList || $scope.showCardList) {//open
					$scope.cancel();
					$scope.cancel2();
					$scope.$apply();
				} else {//close
					$scope.finishGo();
				}
			};
			//响应android物理返回键(顺手付)
			window.onBack = function(){
				window.doKeyBack();
			};

			$scope.withholdWayList = [];//扣款方式

			//代扣详情
			if (withholdDetail && withholdDetail.data && withholdDetail.data.rltCode == '00' && withholdDetail.data.data) {
				var withholdDetailResult = NirvanaUtil.decryptRespone(withholdDetail.data.data,withholdDetail.data.responseTime);
				if(!withholdDetailResult){return;}
				$scope.status = withholdDetailResult.status;//代扣签约状态，如下：

				$scope.signTime = withholdDetailResult.signTime;//签约时间
				$scope.content = withholdDetailResult.content;//代扣内容
				$scope.merchantName = withholdDetailResult.merchantName;//商户名称
				$scope.merchantIcon = withholdDetailResult.merchantIcon;//商户图标

				$rootScope.merchantId = withholdDetailResult.merchantId;
				$rootScope.businessCode = withholdDetailResult.businessCode;
				$rootScope.tradeScene = withholdDetailResult.tradeScene;

				StorageDataService.setBindDate('phoneNumber', withholdDetailResult.mobile);

				//queryWithholdType();

				var details = withholdDetailResult.detail;//扣款方式,Json字符串,有可能为空
				if (details && details.length > 0) {
					for (var i = 0; i < details.length; i++) {
						if (details[i].type == 'BALANCE') {//扣款方式，BALANCE--余额,BANKCARD--银行卡
							$scope.hasBalance = true;//有余额
							continue;
						}
						$scope.withholdWayList.push(details[i]);
					}
				}
			} else {
				Toast.show(withholdDetail.data.rltMsg);
			}

			//该接口用于代扣签约扣款方式的查询，主要有如下三种：卡、余额、卡和余额。
			function queryWithholdType(){
				WithholdType.query()
					.success(function(response){
						if (response.rltCode == '00' && response.data) {
							var result = NirvanaUtil.decryptRespone(response.data,response.responseTime);
							$rootScope.contractType = result.contractType;//扣款类型，BALANCE：余额 BANKCARD：银行卡 ALL：余额和银行卡
						} else {
							Toast.show(response.rltMsg);
						}
						$rootScope.loading = false;
					})
					.error(function(response){
						$rootScope.loading = false;
						Toast.show(response.rltMsg);
					});
			}

			function setIconSelected(bankModel){
				if(!bankModel){
					bankModel = $scope.withholdWayList[0];
				}
				if(bankModel){
					for(var i = 0; i < $scope.banklist.length; i++){
						var bank = $scope.banklist[i];
						if((bank.signNo == bankModel.signNo)||(bank.cardNo == bankModel.cardNo&&bank.cardType==bankModel.cardType)){//扣款方式，BALANCE--余额,BANKCARD--银行卡
							$scope.iconSelected = i;//默认银行卡选中
							return;
						}
					}
					//$scope.$apply();
				}
			}

			var selectedBankCardModel;
			//打开更换银行卡列表（储蓄银行卡列表）
			$scope.change = function(bankModel){
				selectedBankCardModel = bankModel;
				getPayListWithhold();
				$scope.showPayList = true;
				setIconSelected(bankModel);
			};

			//关闭层
			$scope.cancel = function () {
				if(flag == "bankCardList"){
					$scope.finishGo();
				}else{
					$scope.showPayList = false;
				}
			};
			$scope.iconSelected = 0;//默认第一张银行卡选中
			//选择一张储蓄卡
			$scope.selectedDebitBank = function(index){
				$scope.iconSelected = index;
				var bankModel = $scope.banklist[index];
				if(!hasBankMobile(bankModel)){
					$rootScope.params_setMobile = {
						'bankModel':bankModel, 'withhodFlag':'change'
					}
					$state.go('setMobile');
				}
			};
			//判断是否有银行预留手机号
			function hasBankMobile(bankModel) {
				if (!bankModel || bankModel.bankMobile == null || bankModel.bankMobile == '') {//假如没有预留银行手机号
					return false;
				}
				return true;
			}

			//使用新银行卡(从代扣进入添卡)
			$scope.addBankCard = function(){
				$rootScope.openedBankListAtSwitch = true;
				NirvanaUtil.clearAddBankCardCache();
				$rootScope.sceneCode = '';
				StorageDataService.setParam('toAddBankCode', 6);
				$rootScope.notWithholdSign = 'Y';
				$state.go('bankcardAdd');//添卡时不开通代扣
			};

			//查看支持的银行卡列表（不可选择）
			$scope.supportBankCard = function(){
				getSupportBankList();
				$scope.debitCardListShow = true;//默认显示储蓄卡
				var input= $('input[type=text],input[type=tel]').blur();
				var t = $timeout(function () {
					$scope.showCardList = true;
					$timeout.cancel(t);
				}, 800)
			};
			//关闭层
			$scope.cancel2 = function () {
				$scope.showCardList = false;
			};
			//储蓄卡和信用卡不同时显示
			$scope.debitCardListShow = true;
			$scope.showDebitCardList = function() {
				$scope.debitCardListShow = true;
			};
			$scope.showCreditCardList = function() {
				$scope.debitCardListShow = false;
			};

			//确定更换
			$scope.okChange = function(){
				var bankModel = $scope.banklist[$scope.iconSelected];
				if(!hasBankMobile(bankModel)){
					$rootScope.params_setMobile = {
						'bankModel':bankModel, 'withhodFlag':'change'
					}
					$state.go('setMobile');
					return;
				}
				StorageDataService.setWthholdData('bankModel', bankModel);
				StorageDataService.setWthholdData('withhodFlag', 'change');
				$state.go('withholdInputPayPwd');
			};

			$scope.banklist = [];

			//代扣银行卡列表
			function getPayListWithhold(){
				if($scope.banklist.length > 0){//已经有值，就不再加载
					return;
				}
				//$rootScope.loading = true;
				payListForWithholdService.query()
					.success(function(response){
						$rootScope.loading = false;
						if(response.rltCode == 00){
							var data_new = NirvanaUtil.decryptRespone(response.data,response.responseTime);
							var paylist = data_new.paymentList;
							if(paylist == null || paylist.length <= 0){
								return;
							}
							//type:代表支付类型，取值：QUICK或者WITHHOLDING
							$scope.banklist = [];
							for(var i = 0; i < paylist.length; i++){
								if(paylist[i].type == 'BALANCE'){//扣款方式，BALANCE--余额,BANKCARD--银行卡
									continue;
								}
								$scope.banklist.push(paylist[i]);
							}
							setIconSelected(selectedBankCardModel);
						}else{
							Toast.show(response.rltMsg);
						}
					}).error(function(response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			}

			//支持的银行列表(不可选择)
			//储蓄卡
			$scope.debits2 = [];
			//信用卡
			$scope.credits2 = [];
			//(仅供查看列表)不可选择
			function getSupportBankList(){
				if($scope.debits2.length > 0){
					return;
				}
				var isRealName = "Y";
				//$rootScope.loading = true;
				queryBankListService.query(isRealName).
				success(function(response) {
					$rootScope.loading = false;
					if (response.rltCode == '00' && response.data) {
						var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
						$scope.debits2 = res.debits;
						$scope.credits2 = res.credits;
					}else{
						Toast.show(response.rltMsg);
					}
				}).
				error(function(response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			}
			//flag==bankCardList表示要代扣银行卡列表
			var urlSearch = URLParseService.init();
			var flag = urlSearch['flag'];
			$rootScope.withholdBankCardListFlag = flag;//如果从App进入代扣银行卡列表，更换成功后要关闭界面
			//已经打开过更换银行卡列表，返回该界面时要打开
			if(flag == "bankCardList" || ($rootScope.openedBankListAtSwitch && $rootScope.newBankCardModel)){
				$rootScope.openedBankListAtSwitch = false;
				var newBankCard = $rootScope.newBankCardModel;
				$scope.change(newBankCard);
			}
		}])
		/*输入支付密码 hash:withholdInputPayPwd*/
		.controller('withholdInputPayPwdCtrl', ['$scope','$state', '$rootScope', '$timeout', '$compile', '$document', 
			'validatePWDService', 'StorageDataService', 'withholdService', 'WithholdBankCard', 'NirvanaUtil', 'Toast', function($scope,$state, $rootScope, $timeout, $compile, $document, validatePWDService, StorageDataService, withholdService, WithholdBankCard, NirvanaUtil, Toast){
			$scope.goBack = function(){
				showAlertView();
			};
			window.doKeyBack = function(){
				$scope.goBack();
			};
			//响应android物理返回键(顺手付)
			window.onBack = function(){
				window.doKeyBack();
			};

			/*  进入页面后模拟获取焦点  */
			$(document).ready(function(){
				$("#pwd-box").trigger("click");
			});

			var mobile = $scope.mobile = StorageDataService.getBindDateByKey('phoneNumber');
			var bankModel = StorageDataService.getWthholdDataByKey('bankModel');
			var withhodFlag = StorageDataService.getWthholdDataByKey('withhodFlag');

			var bbBox;
			function showAlertView(){
				if(bbBox != null){
					bbBox.remove();
				}
				var msg = "";
				if(withhodFlag == 'open'){
					msg = "确定要放弃开通代扣服务？";
				}else if(withhodFlag == 'change'){
					msg = "确定要放弃更换代扣银行卡？";
				}
				msg = msg.replace(/\s+/g,"");
				bbBox = $compile('<bb-confirm msg='+msg+' ok-callback="endFunc()"></bb-confirm>')($scope);
				$document.find('body').append(bbBox);
			}

			$scope.endFunc = function(){
				bbBox.remove();
				exitWithhold(1);
			};
			//退出代扣模块
			function exitWithhold(state) {
				if ($rootScope.sourceType == 'SFFIX') {//顺维修接入
					window.location.href = $rootScope.forwardUrl;
				} else {
					if (NirvanaUtil.browser().ios) {//兼容ios关闭界面
						window.location.href = "doBackSchmel://sfpay.com";
					} else {
						NirvanaUtil.doBack(state);
					}
				}
			}

			$scope.payPassword = "";
			$scope.verifyPwd = function(){
				var payPwd = $scope.payPassword;
				if(payPwd != null && payPwd.length == 6){
					if(withhodFlag == 'change'){
						switchBankCard();
					}else if(withhodFlag == 'open'){
						validPayPwdAndWithhold();//验证支付密码并开通代扣
					}
				}
			};

			function confirm(alertMsg){
				if(bbBox != null){
					bbBox.remove();
				}
				alertMsg = alertMsg.replace(/\s+/g,"");
				bbBox = $compile('<bb-confirm msg='+alertMsg+' conleft="继续支付" conright="忘记密码" ok-callback="findPayPwd()"></bb-confirm>')($scope);
				$document.find('body').append(bbBox);
			}
			function alert(alertMsg){
				alertMsg = alertMsg.replace(/\s+/g,"");
				var bbBox = $compile('<bb-alert msg='+alertMsg+'></bb-alert>')($scope);
				$document.find('body').append(bbBox);
			}

			//执行更换银行卡
			function switchBankCard(){
				//代扣签约协议号
				var contractNo = $rootScope.contractNo;
				var authNo = bankModel.signNo;
				WithholdBankCard.switch(contractNo, authNo, bankModel.type, $scope.payPassword)
					.success(function(response) {
						$rootScope.loading = false;

						if (response.rltCode == '00' && response.data) {
							var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
							if(result.isSuccess == 'Y'){
								$('.pwd-input').blur();
								$rootScope.setMobile_phoneNumber = null;//银行预留手机号
								$rootScope.setMobile_validCode = null;//修改银行预留手机号短信验证码
								//StorageDataService.setWthholdData('bankModel', null);
								//StorageDataService.setWthholdData('withhodFlag', '');
								Toast.show("更换银行卡成功！");
								var flag = $rootScope.withholdBankCardListFlag;
								if(flag == "bankCardList"){
									exitWithhold(0);
								}else{
									$timeout(function() {$state.go("withholdingSwitch");}, 2000);
								}
							}
						}else if(response.rltCode == "14403" || response.rltCode == "11005"){
							confirm(response.rltMsg);
						}else{
							alert(response.rltMsg);
						}
					}).error(function(response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			}
			//用于开通代扣
			function validPayPwdAndWithhold(){
				validatePWDService.valid(mobile, $scope.payPassword)
					.success(function(response) {
						$rootScope.loading = false;
						if (response.rltCode == '00' && response.data) {
							//var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
							//支付密码验证成功，开通代扣
							$('.pwd-input').blur();
							signWithhold();
						}else if(response.rltCode == "14403"){
							confirm(response.rltMsg);
						}else{
							alert(response.rltMsg);
						}
					}).error(function(response) {
					$rootScope.loading = false;
					alert(response.rltMsg);
				});
			}
			//开通代扣
			function signWithhold(){
				var params = {
					userMobile:$rootScope.userMobile,
					merchantId:$rootScope.merchantId,
					userId:$rootScope.userId,
					userName:$rootScope.userName,
					cardNo:bankModel.cardNo,
					cardType:bankModel.cardType,
					bankCode:bankModel.bankCode,
					bankName:bankModel.bankName,
					signNo:bankModel.signNo,
					type:bankModel.type,
					mobile:$rootScope.setMobile_phoneNumber,//银行预留手机号
					smsCode:$rootScope.setMobile_validCode,//修改银行预留手机号短信验证码
					password:$scope.payPassword
				};
				$rootScope.loading = true;
				withholdService.sign(params).
				success(
					function(response) {
						$rootScope.loading = false;
						if (response.rltCode == '00' && response.data) {
							//var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
							$rootScope.setMobile_phoneNumber = null;//银行预留手机号
							$rootScope.setMobile_validCode = null;//修改银行预留手机号短信验证码
							//StorageDataService.setWthholdData('bankModel', null);
							//StorageDataService.setWthholdData('withhodFlag', '');
							Toast.show("开通委托代扣成功！");
							$timeout(function() {$state.go('bindSuccess');}, 2000);
						}else if(response.rltCode == '14021'){
							$state.go('accountErr');
						}else{
							Toast.show(response.rltMsg);
						}
					}).
				error(function(response) {
					$rootScope.loading = false;
					Toast.show(response.rltMsg);
				});
			}

			//忘记支付密码
			$scope.findPayPwd = function(){
				if(bbBox != null){
					bbBox.remove();
				}
				$rootScope.userMobile = mobile;
				StorageDataService.setParam('toGetPwdCode',4);
				$state.go('findPayPwdAccount');
			}

		}]);

});