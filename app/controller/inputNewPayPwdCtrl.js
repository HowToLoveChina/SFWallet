/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/verify");
    require("../factory/modifyPayPwdHttpService");
    require("../factory/pageSlide");
    require("../directive/directive");
    app
    //设置新的支付密码
        .controller('inputNewPayPwdCtrl', ['passwordService','$document','$compile',
            'modifyPayPwdHttpService','Toast','$rootScope','$scope','$state','StorageDataService','pageSlide',
            function(passwordService,$document,$compile,modifyPayPwdHttpService,Toast,$rootScope, $scope,$state,StorageDataService,pageSlide){
                $scope.goBack = function(){
                    _confirm();
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                var oldPwd = $rootScope.oldPwd;
                var bbBox = null;

                $scope.okFn = function(){
                    bbBox.remove();
                    $state.go('securityHome');
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
                //首次密码验证
                $scope.verifyPwd = function(){
                    var pwd = $scope.payPassword;
                    if (pwd == oldPwd) {
                        alert('新密码不能与原密码相同');
                    }else{
                        var r = passwordService.check(pwd, pwd);
                        if(r != 0){
                            clearPwd();
                            return ;
                        }
                        $rootScope.inputRePayPwdObj = {
                            oldPwd:oldPwd,newPwd:pwd
                        }
                        $('.pwd-input').blur();
                        $state.go('inputRePayPwd');
                    };
                }
                //清除密码
                function clearPwd(){
                    $scope.payPassword = "";
                    $('#pwd-list').find('li').removeClass('finished');
                }
            }
        ])
        //重新输入新密码
        .controller('inputRePayPwdCtrl', ['passwordService','$document','$compile',
            'modifyPayPwdHttpService','Toast','$rootScope','$scope','$state','StorageDataService','pageSlide',
            function(passwordService,$document,$compile,modifyPayPwdHttpService,Toast,$rootScope, $scope,$state,StorageDataService,pageSlide){
                $scope.goBack = function(){
                    _confirm();
                };
                window.doKeyBack = function(){
                    $scope.goBack();
                }
                var bbBox = null;
                var oldPwd = $rootScope.inputRePayPwdObj.oldPwd;
                var newPwd = $rootScope.inputRePayPwdObj.newPwd;
                function _confirm(){
                    if(bbBox != null){
                        bbBox.remove();
                    }
                    bbBox = $compile('<bb-confirm msg="确定放弃修改支付密码？" ok-callback="okFn()"></bb-confirm>')($scope);
                    $document.find('body').append(bbBox);
                };
                $scope.okFn = function(){
                    bbBox.remove();
                    $state.go('securityHome');
                }

                //再次密码验证
                $scope.verifyPwd = function(){
                    var rePwd = $scope.payPassword;
                    if (newPwd != rePwd) {
                        Toast.show('两次输入不一致，请重新设置');
                        $rootScope.oldPwd = oldPwd;
                        $state.go('inputNewPayPwd');
                    }else if (newPwd == rePwd && rePwd != '') {
                        //对密码的合法性验证
                        var r = passwordService.check(newPwd, rePwd);
                        if(r != 0){
                            clearPwd();
                            return ;
                        }
                        updatePayPassWord();
                    }
                }
                //清除密码
                function clearPwd(){
                    $scope.payPassword = "";
                    $('#pwd-list').find('li').removeClass('finished');
                }

                //调用更新支付密码接口
                function updatePayPassWord(){
                    $rootScope.loading = true;
                    modifyPayPwdHttpService.updatePayPassWord($rootScope.userMobile,oldPwd,$scope.payPassword,sessionStorage.oneValidateCode)
                        .success(function(response){
                            $rootScope.loading = false;
                            $('.pwd-input').blur();
                            if(response.rltCode == '00'){
                                $state.go('securityHome');
                            }else if(response.rltCode == '14021'){
                                $state.go('accountErr');
                            }else{
                                Toast.show(response.rltMsg);
                                $rootScope.oldPwd = oldPwd;
                                $state.go('inputNewPayPwd');
                            };
                        }).error(function(response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                        $rootScope.oldPwd = oldPwd;
                        $state.go('inputNewPayPwd');
                    });
                }
            }
        ]);
    

});