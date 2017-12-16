/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/BankCard");
    require("../directive/directive");
    app
        .controller('inputOldPayPwdCtrl', ['$document','$compile','validatePWDService','Toast','$rootScope',
            '$scope','$state','StorageDataService',
            function($document,$compile,validatePWDService,Toast,$rootScope, $scope,$state,StorageDataService){
                $scope.goBack = function(){
                    _confirm();
                };
                window.doKeyBack = function(){
                    _confirm();
                }

                var bbBox = null;
                var inputpwdData = StorageDataService.getInputPwdParam();
                var password = '';
                $scope.okFn = function(){
                    bbBox.remove();
                    $state.go('securityHome');
                }
                $scope.getPwdFn = function(){
                    bbBox.remove();
                    StorageDataService.setParam('toGetPwdCode',5);
                    $state.go('findPayPwdAccount');
                }
                $scope.reInputPwd = function(){
                    bbBox.remove();
                    $('.pwd-input').focus();
                }
                function alert(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-alert msg='+alertMsg+'></bb-alert>')($scope);
                    $document.find('body').append(bbBox);
                };
                function _confirm(){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    bbBox = $compile('<bb-confirm msg="确定放弃修改支付密码？" ok-callback="okFn()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };
                function confirm(alertMsg){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    alertMsg = alertMsg.replace(/\s+/g,"");
                    bbBox = $compile('<bb-confirm msg='+alertMsg+' conleft="重新输入" conright="忘记密码" warn-callback="reInputPwd()" ok-callback="getPwdFn()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };

                //输入原支付密码验证
                $scope.verifyPwd = function(){
                    $rootScope.loading = true;
                    var oldPwd = $scope.payPassword;
                    validatePWDService.valid($rootScope.userMobile,oldPwd)
                        .success(function(response){
                            $rootScope.loading = false;
                            $('.pwd-input').blur();
                            if(response.rltCode == '00'){
                                $rootScope.oldPwd = oldPwd;
                                $state.go("inputNewPayPwd");
                            }else if(response.rltCode == "14003"){
                                confirm(response.rltMsg);
                            }else if(response.rltCode == '14021'){
                                $state.go('accountErr');
                            }else{
                                alert(response.rltMsg);
                            };
                        }).error(function(response) {
                        $rootScope.loading = false;
                        alert(response.rltMsg);
                    });
                }
            }
        ]);
});