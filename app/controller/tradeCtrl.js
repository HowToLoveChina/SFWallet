/**
 * Created by SF on 7/5/16.
 */
// define(['require', 'app'], function (require, app) {
define(function (require) {
	var app = require('../app');
	require('../factory/tradeHttp');
	require('filter');

	app
		.controller('tradeListCtrl', ['$rootScope','$scope','$state','NirvanaUtil','Toast','findBillListHttpService', '$timeout',
			function($rootScope, $scope,$state, NirvanaUtil,Toast,findBillListHttpService,$timeout){

				$scope.goBack = function(){
					window.history.back();
				};
				window.doKeyBack = function(){
					window.history.back();
				};
				var index = 0;
				var indexNum = 0;
				var size = 15;
				var smallIndex = 0;
				var businessNo = '';
				var tradeType = '';
				var status = 11;
				var loadTime = null;

				$scope.goDetail = function(businessNo,tradeType){
					$rootScope.params_tradeDetail = {
						businessNo:businessNo,tradeType:tradeType
					}
					$state.go("tradeDetail");
					//myScroll.destroy();//注销iScroll来释放内存
				};

				//交易日期 月份判断
				var today = new Date();
				$scope.thisMonth = today.getMonth()+1;

				$scope.hasRecord = true;
				$scope.pullUpLoading = false;
				//$scope.hasListText = true;
				$scope.tradeRecord = [];

				function findBillList(){
					$rootScope.loading = true;
					findBillListHttpService.findBillList($rootScope.userMobile,status,index,smallIndex,size)
						.success(function(response){
							$rootScope.loading = false;
							if(response.rltCode == '00'){
								var data_get = NirvanaUtil.decryptRespone(response.data,response.responseTime);
								//如果没有数据，无交易记录
								isLast = data_get.length;
								if(data_get.length == 0){
									$scope.hasRecord = false;
								}else{
									$scope.hasRecord = true;
									// console.log(data_get);
									$scope.tradeRecord = data_get.map(function (item) {

										item.tradeList.map(function (d) {
											if(/^\+/.test(d.amount)){
												d.sign=true;
											}else  if(/^\-/.test(d.amount)){
												d.sign=false;
											}
											return d;

										});
										return item;
									});
									// console.log($scope.tradeRecord);
									//index = (indexNum+1)*size;
									//smallIndex = index + size;
									//indexNum++;
									var lengthGet = data_get.length;
									var lengthDep = data_get[lengthGet-1].tradeList.length;
									smallIndex = data_get[lengthGet-1].tradeList[lengthDep-1].id;
								}
							}else if(response.rltCode == '14021'){
						$state.go('accountErr');
					}else{
						Toast.show(response.rltMsg);
						$scope.hasRecord = false;
						//$scope.hasListText = false;
						$('.transList img').attr("src","../images/norecord_icon2.png");
						$('.transList span').html("网络不给力，请稍后重试");
					};
				}).error(function(response) {
						$rootScope.loading = false;
						$scope.hasRecord = false;
						//$scope.hasListText = false;
						$('.transList img').attr("src","../images/norecord_icon2.png");
						$('.transList span').html("网络不给力，请稍后重试");
						Toast.show(response.rltMsg);
					});
				}
				findBillList();

				var isLast;

				/*加载更多数据*/
				function findMoreBillList(){
					$rootScope.loading = true;
					findBillListHttpService.findBillList($rootScope.userMobile,status,index,smallIndex,size)
						.success(function(response){
							$rootScope.loading = false;
							if(response.rltCode == '00'){
								var data_get = NirvanaUtil.decryptRespone(response.data,response.responseTime);
								isLast = data_get.length;
								if(data_get.length == 0){
									$scope.pullUpLoading = true;
									$('.pullUpLabel').html('已加载全部，没有更多数据...');
								}else{
									var lengthGet = data_get.length;
									var lengthDep = data_get[lengthGet-1].tradeList.length;
									smallIndex = data_get[lengthGet-1].tradeList[lengthDep-1].id;
									//如果是同一个月份的数据，则合并在一起
									var length = $scope.tradeRecord.length;
									if (data_get[0].month == $scope.tradeRecord[length-1].month) {
										$scope.tradeRecord[length-1].tradeList = $scope.tradeRecord[length-1].tradeList.concat(data_get[0].tradeList)
										if(data_get.splice(0,1).length > 0){
											$scope.tradeRecord = $scope.tradeRecord.concat(data_get.splice(0,1));
										}
									}else{
										$scope.tradeRecord = $scope.tradeRecord.concat(data_get);
									};
									//index = (indexNum+1)*size;
									//smallIndex = index + size;
									//indexNum++;

								};
							}else if(response.rltCode == '14021'){
								$state.go('accountErr');
							}else{
								Toast.show(response.rltMsg);
							};
						}).error(function(response) {
						$rootScope.loading = false;
						Toast.show(response.rltMsg);
					});
				}


				var box=$('.list');
				//*** 下拉刷新
				function pullDownAction () {
					index = 0;
					indexNum = 0;
					smallIndex = 0;
					$scope.tradeRecord = [];
					findBillList();
					$scope.$apply();
					box.scrollTop(21);
				}

				//*** 上拉加载
				function pullUpAction() {
					findMoreBillList();
					//$scope.$apply(); // 数据加载完成后，调用界面更新方法
				}

				$(document).ready(function(){
					box.scroll(function(){
							var scrollTop = box.scrollTop(),		// 滚动高度
							pageHeight = box[0].scrollHeight,		// 内容高度
							contentHeight = $(document).height()-55;// 页面高度
						// if(scrollTop == 0){
						// 		pullDownAction();
						// }else 
						if(loadTime){
							clearTimeout(loadTime);
							loadTime = null;
						}
						if(scrollTop + contentHeight == pageHeight && isLast){
							$scope.pullUpLoading = true;
							$('.pullUpLabel').html('上拉加载更多...');
							loadTime = $timeout(function(){
								pullUpAction();
							},300);
						}
					});
				});


			}])
		.controller('tradeDetailCtrl', ['NirvanaUtil','Toast','findBillListHttpService','$rootScope','$scope','$state',
			function(NirvanaUtil,Toast,findBillListHttpService,$rootScope, $scope,$state){
				$scope.goBack = function(){
					window.history.back();
				};
				window.doKeyBack = function(){
					window.history.back();
				};

				var businessNo = $rootScope.params_tradeDetail.businessNo;
				var tradeType = $rootScope.params_tradeDetail.tradeType;

				// $scope.tradeTimeDiv = false;
				// $scope.merchantNameDiv = false;
				// $scope.payTypeDiv = false;
				// $scope.businessNoDiv = false;
				// $scope.remarkDiv = false;
				findBillDetail();
				function findBillDetail(){
					$rootScope.loading = true;
					findBillListHttpService.findBillDetail(businessNo,tradeType)
						.success(function(response){
							$rootScope.loading = false;
							if(response.rltCode == '00'){
								var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
								$scope.amount = data.amount;
								$scope.title = data.title;
								$scope.status = data.status;
								$scope.code = data.code;

								if(data.merchantName){
									$scope.merchantName = data.merchantName;
									// $scope.merchantNameDiv = true;
								}
								if(data.tradeType){
									$scope.tradeTime = data.tradeType;
									// $scope.tradeTimeDiv = true;
								}
								if(data.payType){
									$scope.payType = NirvanaUtil.trans2PayType(data.payType);
									$scope.payTypeDiv = true;
								}
								if(data.businessNo){
									$scope.businessNo = data.businessNo;
									// $scope.businessNoDiv = true;
								}
								if(data.remark){
									$scope.remark = data.remark;
									// $scope.remarkDiv = true;
								}
							}else if(response.rltCode == '14021'){
								$state.go('accountErr');
							}else{
								Toast.show(response.rltMsg);
							};
						}).error(function(response) {
						$rootScope.loading = false;
						Toast.show(response.rltMsg);
					});
				}
			}

		]);

});



	