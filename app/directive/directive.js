
define(['require','app'],function (require,app) {
	// var app = require('../app');
	app
	/* 输入框旁边 倒计时
	 参数说明：
	 times(倒计时的时间)
	 text(倒计时按钮显示的文本)
	 phoneNumber(发送验证码到哪个手机上)
	 onSend(没想好干嘛用)

	 调用：
	 verify.html:
	 <count-down text="发送验证码" times="10" phone-number="13590457837"></count-down>
	 */
	.directive('countDown', ['$timeout', function($timeout){
		return {
			restrict: 'AE',
			replace:true,
			scope: {
				text:'@',
				times:'=',
				phoneNumber:'=',
				onSend:'&',
				ifSend:'='
			},
			template: '<button type="button" ng-disabled="hideBtn" ng-click="onSend()" class="button"><i class="timers">{{text}}</i></button>',
			link: function($scope, elm, attrs) {
				var leaveTime = 0,timeoutId;
				function updateTimer(){
					elm.find('.button').attr('disabled','true');
					timeoutId = $timeout(function(){
						leaveTime--;
						$scope.text = leaveTime+'秒后重发';
						//elm.find('.timers').html(leaveTime+'秒后重发');
						if(leaveTime<1){
							$timeout.cancel(timeoutId);
							$scope.text = '重新发送';
							//elm.find('.timers').html('重新发送');
							elm.find('.button').removeAttr('disabled');
							$scope.ifSend = false;//倒计时完毕则将是否发送关键字至为false。
						}else{
							updateTimer();
						}
					},1000);
				}
				function countdown(){
					leaveTime = $scope.times;
					leaveTime--;
					//elm.find('.timers').html(leaveTime+'秒后重发');
					$scope.text = leaveTime+'秒后重发';
					//alert("更新文字");
					updateTimer();
				}
				//监听是否发送关键字，为true则倒计时。
				$scope.$watch('ifSend',function(){
					if($scope.ifSend ==true){
						$scope.hideBtn = true;
						countdown();
					}else{
						$scope.hideBtn = false;
					}
				});
			}
		};
	}])

	/*  密码控件
	 参数：wrapper(密码控件页面的页面内容框)
	 onFinished(密码控件输入完成之后执行的函数，从外面的controller定义之后传进来)
	 password(用户输入的密码，跟外部controller双向绑定)

	 调用：
	 payment.html：
	 <pwd-box wrapper=".pwd-wrapper" password="payPassword" on-finished="verifyPwd()"></pwd-box>

	 paymentctrl.js：
	 $scope.payPassword = "";
	 $scope.verifyPwd = function(){
	 // $scope.payPassword = pwd;
	 console.log('pwd:'+$scope.payPassword);
	 // alert(pwd);
	 };
	 */
		.directive('pwdBox', ['$rootScope','$timeout',function($rootScope,$timeout){
			return {
				scope: {
					wrapper:'@',
					onFinished:'&',
					password:'=',
					inpType:'@',
					promptMsg:'@'
				},
				restrict: 'AE',
				replace: true,
				transclude: true,
				template:
				'<div class=" pwd-content">'+
				'<div id="pwd-box" class="pwd-box" ng-click="keyboradInputfocus()">'+
				'<input class="pwd-input" id="pwd-input" type="tel" tabindex="1" oncontextmenu="return false" onpaste="return false" oncopy="return false" oncut="return false" autocomplete="off"   required  maxlength="6" ng-model="password" ng-change="pwdChange()" ng-blur="keyboradInputBlur()" />'+
				'<ul class="pwd-list" id="pwd-list">'+
				'<li><i></i></li><li><i></i></li><li><i></i></li><li><i></i></li><li><i></i></li><li><i></i></li>'+
				'</ul>'+
				'</div>'+
				'<p class="tc"></p>'+
				'</div>',
				link: function($scope, elm, attrs) {

					$scope.pwdLen = true;

					//键盘focus
					$scope.keyboradInputfocus = function(){
						$scope.password = "";
						elm[0].firstElementChild.firstElementChild.focus();
						/*var h=elm.offset().top-50;
						 $($scope.wrapper).find('.scroll').css('top',-h);*/
					};
					$scope.keyboradInputfocus();
					//键盘blur
					$scope.keyboradInputBlur = function(){
						/*$('.pwd-wrapper').find('.scroll').css('top',0);*/
						elm.find('li').removeClass('finished');
						$scope.password = "";
					};

					//输入密码
					$scope.pwdChange = function(){
						var payPwdVal=$scope.password;
						if(payPwdVal !='' && payPwdVal != null){
							var len = payPwdVal.length;
							if (len != 0) {
								if(len >= 6){
									$scope.pwdLen = false;
									// console.log($scope.password);
									$timeout(function(){
										$scope.onFinished.call(elm);
										// $('input:focus').blur();
									},67);
								}else{
									$scope.pwdLen = true;
								}
								elm.find('li').removeClass('finished');
								// elm.find('li').html('');
								for ( var i = 0; i < len; i++) {
									elm.find('li').eq(i).addClass('finished');
									// elm.find('li').eq(i).html('●');
								}
							}
						}else {
							elm.find('li').removeClass('finished');
							// elm.find('li').html('');
						}
					};

					//监听输入框状态
					$scope.$watch('inpType',function(){
						// console.log($scope.inpType);
						if($scope.inpType=='true'){
							$scope.keyboradInputfocus();
						}else if($scope.inpType=='false'){
							elm.find('.pwd-input').blur();
						}
					});

					//点击键盘
					/*elm.find('.pwd-box').on('click',function(){
					 elm.find('.pwd-input').focus();
					 var h=elm.offset().top-50;
					 $($scope.wrapper).find('.scroll').css('top',-h);
					 });
					 //光标移出键盘
					 elm.find('.pwd-input').on('blur',function(){
					 $('.pwd-wrapper').find('.scroll').css('top',0);
					 elm.find('li').removeClass('finished');
					 $scope.password = "";
					 });*/
				}
			};
		}])

		.directive('pwdBox2', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
			return {
				scope: {
					onFinished: '&',
					password: '=',
					findPwd: '&',
					onClose: '&'
				},
				restrict: 'AE',
				replace: true,
				transclude: true,
				templateUrl: 'directive/pwdBox/pwdBox.html',
				link: function ($scope, elm, attrs) {
					var myHTML = document.querySelector("html");

					// // $scope.findPayPwd();
					// setFontSize = function () {
					//     var max = 414;
					//     var myWidth = document.documentElement.clientWidth > max ? max : document.documentElement.clientWidth;
					//     myHTML.style.fontSize = 100 * myWidth / max + 'px';
					// };
					// window.onresize = function () {
					//     this.setFontSize();
					// };
					//
					// setFontSize();
					var Keyboard = function (options) {

						this.isShow = false;
						this.value = options.value || [];
						this.maxLength = options.maxLength || 6;
						this.container = options.container || $("body");
						this.onClose = options.onClose || function () {
							};
						this.onUpdate = options.onUpdate || function () {
							};
						// (function (win, doc) {


						// })(window, document);

						this.init = function () {
							this.ui = {};
							this.ui.html = $("html");
							this.ui.wrap = $($("#js-template").html());
							this.ui.btnClose = this.ui.wrap.find(".btn-close");
							this.ui.btnBackspace = this.ui.wrap.find(".btn-backspace");
							this.ui.btnNumber = this.ui.wrap.find(".btn-number");
							this.ui.btnForget = this.ui.wrap.find(".btn-forget");
							this.ui.loading = this.ui.wrap.find(".loading-wrap");
							this.ui.context = this.ui.wrap.find(".loading-context");
							this.ui.keyboard = this.ui.wrap.find(".keyboard-wrap");
							this.ui.pwdLi = this.ui.wrap.find(".div-context li");
							this.ui.btnLi = this.ui.wrap.find(".keyboards li");
							this.ui.jsWrap = this.ui.wrap.find(".js-wrap");
							this.ui.input = $("input");

							this.regEvent();
							this.ui.wrap.appendTo(this.container);
							this.show();

							return this;
						};

						this.regEvent = function () {
							var _this = this;


							this.ui.btnLi.on("touchstart", function () {
								$(this).addClass('active');

								//return false;
							});

							this.ui.btnLi.on("touchend", function () {
								$(this).removeClass('active');

								//return false;
							});

							this.ui.btnNumber.on("touchstart", function () {
								_this.push($(this).data("number"));

								return false;
							});

							this.ui.btnClose.on("touchstart click", $.proxy(function () {
								this.hide();
								this.onClose();

								return false;
							}, this));

							this.ui.btnBackspace.on("touchstart", $.proxy(function () {
								this.pop();

								return false;
							}, this));

							this.ui.btnForget.on("touchstart", $.proxy(function () {
								//忘记密码
							}, _this));
						};

						this.showLoading = function () {
							this.ui.loading.show();
							this.ui.context.hide();
						};

						this.hideLoading = function () {
							this.ui.loading.hide();
							this.ui.context.show();
						};

						this.show = function () {
							var _this = this;

							if (this.isShow) {
								return;
							}

							this.removeBlur();
							this._show();

							return this;
						};


						this._show = function () {
							var _this = this;

							this.showScroll();
							this.hideLoading();
							this.ui.wrap.show();
							this.ui.keyboard.css({
								bottom: -this.ui.keyboard.height()
							});

							this.ui.keyboard.animate({
								bottom: "0px"
							}, 200, function () {
								_this.ui.jsWrap.css({
									top: document.body.scrollTop
								});
							});

							this.isShow = true;
							this.ui.loading.css({height: this.ui.keyboard.height()});
						};

						this.hide = function (callback) {
							var _this = this;

							if (!this.isShow) {
								return;
							}

							this.ui.keyboard.css({
								bottom: "0px"
							});

							this.ui.keyboard.animate({
								bottom: -this.ui.keyboard.height()
							}, 200, function () {
								_this.ui.wrap.hide();

								_this.hideScroll();
								_this.ui.jsWrap.css({
									top: "0px"
								});

								if (callback) {
									callback();
								}
							});

							this.isShow = false;

						};

						this.removeBlur = function () {
							for (var i = 0; i < this.ui.input.length; i++) {
								this.ui.input.get(i).blur();
							}
						};

						this.close = function () {
							var _this = this;

							this.isShow = true;
							this.hide(function () {
								_this.ui.wrap.remove();
							});
						},

							this.push = function (number) {
								if (this.value.length < this.maxLength) {
									this.value.push(number);
								}

								this.change(this.getValue());
							};

						this.pop = function () {
							this.value.pop();

							this.change(this.getValue());
						}

						this.getValue = function () {
							return this.value.join("");
						};

						this.resetValue = function () {
							this.value = [];
							this.change(this.getValue());
						};

						this.change = function (value) {
							this.ui.pwdLi.removeClass('z-on');

							for (var i = 0; i < value.length; i++) {
								this.ui.pwdLi.eq(i).addClass('z-on');
							}

							if (value.length >= this.maxLength) {
								//this.ui.context.hide();
								//this.ui.loading.show();
								this.onUpdate(value);
							}
						};

						this.showScroll = function () {
							this.ui.html.css({'overflow-y': 'hidden'});
						};

						this.hideScroll = function () {
							this.ui.html.css({'overflow-y': 'auto'});
						};

						return this.init();
					};
					var dialogsPwd = new Keyboard({
						onUpdate: function (pwd) {
							// myHTML.style = '';
							dialogsPwd.close();

							$timeout(function () {
								$scope.password = pwd;
								$rootScope.payPassword=pwd;
								console.log($scope.password);
								$scope.onFinished.call(elm);


							}, 67);

							// alert("你输入的密码是:" + pwd);
						}
					});
					$(".btn-forget").on("click", function () {
						// myHTML.style = '';
						dialogsPwd.close();
						$scope.findPwd.call(elm);
					});
					$(".btn-close").on("click", function () {
						// myHTML.style = '';
						dialogsPwd.close();
						$scope.onClose.call(elm);
					});

				}
			};

		}])
		/* 弹出框 */
		.directive('bbAlert', ['$rootScope', function($rootScope){
			return {
				scope: {
					msg:'@'
				},
				restrict: 'AE',
				replace: true,
				transclude: true,
				template: '<div class="bb_alert"><div class="bb_mask"></div><div class="bb_box"><div class="bb_body"><div class="bb_content">{{msg}}</div></div><div class="bb_buttons"><button type="submit" class="bb_button bb_ok" ng-click="ok()">确定</button></div></div>',
				// templateUrl: '',
				link: function($scope, elm) {
					$scope.ok = function(){
						elm.remove();
					};
				}
			};
		}])
		/* 单选框回调 */
		.directive('bbAlertcall', ['$rootScope', function($rootScope){
			return {
				scope: {
					msg:'@',
					okCallback:'&'
				},
				restrict: 'AE',
				replace: true,
				transclude: true,
				template: '<div class="bb_alert"><div class="bb_mask"></div><div class="bb_box"><div class="bb_body"><div class="bb_content">{{msg}}</div></div><div class="bb_buttons"><button type="submit" class="bb_button bb_ok" ng-click="ok()">确定</button></div></div>',
				// templateUrl: '',
				link: function($scope, elm) {
					$scope.ok = function(){
						elm.remove();
						$scope.okCallback.call();
					};
				}
			};
		}])
		.directive('bbConfirm', ['$rootScope', function($rootScope){
			return {
				scope: {
					msg:'@',
					okCallback:'&',
					warnCallback:'&',
					conleft:'@',
					conright:'@'
				},
				restrict: 'AE',
				replace: true,
				transclude: true,
				template: '<div class="bb_wrapper bb_confirm">'+
				'<div class="bb_mask"></div>'+
				'<div class="bb_box">'+
				'<div class="bb_body">'+
				'<div class="bb_content">{{msg}}</div>'+
				'</div>'+
				'<div class="bb_buttons">'+
				'<button type="button" class="bb_button bb_cancel" ng-click="cancel()">{{conleft||"取消"}}</button>'+
				'<button type="submit" class="bb_button bb_ok" ng-click="ok()">{{conright||"确定"}}</button>'+
				'</div>'+
				'</div>'+
				'</div>',
				// template: '<div class="bb_wrapper"><div class="bb_mask"></div><div class="bb_box"></div></div>',
				link: function($scope, elm) {
					$scope.ok = function(){
						$scope.okCallback.call();
						// elm.remove();
					};
					$scope.cancel = function(){
						$scope.warnCallback.call();
						elm.remove();
					};
				}
			};
		}])
		

		/*带清除按钮的文本框*/
		.directive('clearInput',['$log',function($log){
			return{
				restrict:'AE',
				scope:{
					type:'@',//input类型
					inclass:'@',//引入的class样式
					maxlength:'@',//最大长度
					placeholder:'@',//默认提示
					ngModel:'='
				},
				template:
				'<div class="item item-input-inset" style="border:0px">'+
				'<label class="item-input-wrapper" style="background-color:transparent">'+
				'<input type="{{type}}" class="{{inclass}}" maxlength="{{maxlength}}" ng-model="ngModel" placeholder="{{placeholder}}"/>'+
				'<i class="icon ion-android-close placeholder-icon" style="font-size:20px;position:relative;right:20px" ng-click="clearText()"></i>'+
				'</label>'+
				'</div>',
				link:function(scope,elm,attrs){
					scope.clearText = function(){
						scope.ngModel = '';
					}
				}
			}
		}])
	
});








