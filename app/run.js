/**
 * Created by 837781 on 2016/8/3.
 * angularjs run方法
 */
define(['app'], function (app) {
    app
        .run(['$rootScope', '$state', '$timeout','$location','URLParseService','NirvanaUtil',
            function ($rootScope, $state, $timeout,$location,URLParseService,NirvanaUtil) {
                if (noTitle) {
                    $rootScope.noTitle = true;
                }


                $rootScope.$on('$stateChangeStart', function () {

                    if(window.noTitle){//用于微信
                        if($rootScope.securityHomeSucess ||
                            $rootScope.bankListSucess ||
                            $rootScope.paySucess){
                            if ($rootScope.paySucess) {//跳回钱包首页，用于微信
                                $rootScope.paySucess = false;
                                var payCode = $rootScope.payOkObj.payCode;
                                if (1 == payCode || 2 == payCode) {
                                    $location.path('/wallet');
                                } else {
                                    NirvanaUtil.doBack(1);
                                }
                            }else{
                                $location.path('/wallet');
                            }
                        }
                    }
                });

                $rootScope.$on('loading:start', function () {
                    $rootScope.loading = true;
                    alert('loading:start');
                });

                $rootScope.$on('loading:finished', function () {
                    $rootScope.loading = false;
                    alert('loading:finished');
                });

                //如果是苹果手机，并且是丰声app进入，增加内容高度
                var urlSearch = URLParseService.init();
                $rootScope.serviceName = urlSearch['serviceName'];
                if ((NirvanaUtil.browser().ios || NirvanaUtil.browser().iPhone) && $rootScope.serviceName == 'SY_MCH_OPEN_WALLET_REQ') {
                    $rootScope.isIOS = true;
                } else {
                    $rootScope.isIOS = false;
                }

            }])
});