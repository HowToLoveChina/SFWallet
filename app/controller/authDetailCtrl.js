/**
 * Created by SF on 7/11/16.
 */

define( function (require) {
    var app=require("../app");
    require("../factory/authHttpService");
    app
        .controller('authDetailCtrl', ['NirvanaUtil','authHttpService','$rootScope','$scope','$state','Toast',
            function(NirvanaUtil,authHttpService,$rootScope, $scope,$state,Toast){
                $scope.goBack = function(){
                    window.history.back();
                };
                window.doKeyBack = function(){
                    window.history.back();
                }
                queryUserAuthInfo();
                function queryUserAuthInfo(){
                    $rootScope.loading = true;
                    authHttpService.queryUserAuthInfo($rootScope.userMobile)
                        .success(function(response){
                            $rootScope.loading = false;
                            if(response.rltCode == '00'){
                                var data = NirvanaUtil.decryptRespone(response.data,response.responseTime);
                                var memberName = data.memberName;
                                var certType = NirvanaUtil.trans2cerName(data.certType);
                                var certNo = data.certNo;
                                var auth = data.auth;
                                $scope.userName = memberName;
                                $scope.certType = NirvanaUtil.trans2cerName(certType);
                                var stars = '';
                                for(var i = 0;i < certNo.length - 2;i++){
                                    stars += '*';
                                }
                                $scope.certNo = certNo.substr(0,1)+stars+certNo.substr(-1,1);;
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