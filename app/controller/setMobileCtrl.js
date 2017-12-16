/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/VerifyCodeService");
    app
   
        .controller('setMobileCtrl', ['$scope', '$rootScope', '$state',
            'VerifyCodeService','NirvanaUtil', 'StorageDataService','Toast',
            function($scope, $rootScope, $state,VerifyCodeService, NirvanaUtil, StorageDataService,Toast){
                $scope.goBack = function(){
                    window.history.back();
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                };

                var bankModel;
                var withhodFlag;
                if(!$rootScope.params_setMobile.bankModel){
                    bankModel = StorageDataService.getWthholdDataByKey('bankModel');
                    withhodFlag = StorageDataService.getWthholdDataByKey('withhodFlag');
                }else{
                    bankModel = $rootScope.params_setMobile.bankModel;
                    withhodFlag = $rootScope.params_setMobile.withhodFlag;
                }

                initBankCard();

                $scope.obj = {
                    phoneNumber:"",//手机号
                    validCode:""//短信验证码
                };

                $scope.sendFunc = function(){
                    if(!/^1\d{10}$/.test($scope.obj.phoneNumber)){
                        Toast.show('输入的手机号码不正确！');
                        return;
                    }
                    $rootScope.loading = true;
                    //调用通用短信验证，状态码为15表示设置预留手机号验证手机号短信
                    VerifyCodeService.send($scope.obj.phoneNumber,'15')
                        .success(function(response) {
                            if (response.rltCode == '00' && response.data) {
                                // 开始倒计时
                                $scope.sms_count_down = true;
                            }else{
                                Toast.show(response.rltMsg);
                            }
                            $rootScope.loading = false;
                        }).error(function(response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
                };
                function initBankCard(){
                    //----------初始化数据--------------
                    var payType = bankModel.type;
                    var payTypeName = "";
                    if(payType=="QUICK" || null != bankModel.cardType){
                        if(bankModel.cardType=="DEBIT"){
                            payTypeName = bankModel.bankName + "储蓄卡（" + NirvanaUtil.subBank(bankModel.cardNo) + "）";
                        }else{
                            payTypeName = bankModel.bankName + "信用卡（" + NirvanaUtil.subBank(bankModel.cardNo) + "）";
                        }
                    }
                    $scope.iconUrl = bankModel.iconUrl;
                    $scope.bankName = payTypeName;
                }
                //输入支付密码，完成代扣操作
                $scope.setMobileFunc = function(){
                    $rootScope.setMobile_phoneNumber = $scope.obj.phoneNumber;
                    $rootScope.setMobile_validCode = $scope.obj.validCode;
                    StorageDataService.setWthholdData('bankModel', bankModel);
                    StorageDataService.setWthholdData('withhodFlag', withhodFlag);
                    $state.go('withholdInputPayPwd');
                }
            }]);


});