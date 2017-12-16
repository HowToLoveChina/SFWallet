/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    app
        .factory('securityHomeHttpService', ['$http','NirvanaUtil', function($http,NirvanaUtil){
            return {
                findPaymentSafeInfo:function(phoneNumber){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var serviceName = "FIND_PAYMENT_SAFE_INFO";
                    var sign = NirvanaUtil.toSign({"serviceName":serviceName,"mobile":phoneNumber,"platform":"H5","requestTime":requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(phoneNumber,key),//encrypt(phone,key),
                            appType : "001",
                            platform : NirvanaUtil.encrypt("H5",key),
                            serviceName : serviceName,
                            charset : "UTF-8",
                            signType : "DES",
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/findPaymentSafeInfo'
                    });
                },
                verify:function(phoneNumber,vcode,sence){
                    var requestTime = NirvanaUtil.timestamp();
                    var key = NirvanaUtil.md5(requestTime);//签名秘钥
                    var sign = NirvanaUtil.toSign({"serviceName":"VALIDATE_SMS","smsScene":sence,"mobile":phoneNumber,"verify":vcode,"platform":"H5","requestTime":requestTime});
                    return $http({
                        method : 'POST',
                        data : {
                            mobile : NirvanaUtil.encrypt(phoneNumber,key),
                            verify : NirvanaUtil.encrypt(vcode,key),
                            appType : "001",
                            platform : NirvanaUtil.encrypt("H5",key),
                            serviceName : "VALIDATE_SMS",
                            charset : "UTF-8",
                            signType : "DES",
                            smsScene : NirvanaUtil.encrypt(sence,key),
                            requestTime : requestTime,
                            sign : sign
                        },
                        url : '/h5-wallet-nirvana/memberInfo/validateSms'
                    });
                }
            };
        }])
        .controller('securityHomeCtrl', ['StorageDataService','NirvanaUtil','securityHomeHttpService','Toast','$rootScope','$scope','$state',
            function(StorageDataService,NirvanaUtil,securityHomeHttpService,Toast,$rootScope, $scope,$state){
                $scope.goBack = function(){
                    $state.go('wallet');
                };
                window.doKeyBack = function(){
                    $state.go('wallet');
                }
                findPaymentSafeInfo();
                $scope.realAuth = '';
                $scope.goUserAccount = function() {
                    $state.go('account');
                }
                //实名认证
                $scope.goRealNameBindcard = function() {
                    if($scope.isAttestation){
                        $state.go('authDetail');
                    }else{
                        $rootScope.sceneCode = '';
                        StorageDataService.setParam('toAddBankCode',11);
                        $state.go("bankcardAdd");
                    }

                }
                //首页顺手付账号加密显示
                if($rootScope.userMobile){
                    var userMobile = "" + $rootScope.userMobile;
                    $scope.userMobileView = userMobile.substr(0,3) + "****" + userMobile.substr(7)
                }else{
                    $scope.userMobileView = $rootScope.userMobile
                }
                //修改支付密码
                $scope.goModifyPayPwd = function() {
                    StorageDataService.setParam('toGetPwdCode',5);
                    $state.go('modifyPayPwdAccount');
                }
                //找回支付密码
                $scope.goFindPayPwd = function() {
                    // $state.go('findPayPwdAccount');
                    StorageDataService.setParam('toGetPwdCode',5);
                    $state.go('findPayPwdAccount');
                }
                //是否实名认证判断
                $scope.isAttestation = true;

                function findPaymentSafeInfo(){
                    $rootScope.loading = true;
                    securityHomeHttpService.findPaymentSafeInfo($rootScope.userMobile)
                        .success(function(response){
                            $rootScope.loading = false;
                            if(response.rltCode == '00'){
                                var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                if(data.auth == '0'){
                                    $scope.isAttestation = true;
                                    $scope.realAuth = '已认证';
                                }else{
                                    $scope.isAttestation = false;
                                    $scope.realAuth = '未认证';
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