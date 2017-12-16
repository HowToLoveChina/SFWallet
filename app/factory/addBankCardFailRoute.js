/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
    app
    //前端签约失败
        .factory('addBankCardFailRoute', ['NirvanaUtil','$state', 'StorageDataService',
            function(NirvanaUtil,$state, StorageDataService) {
                return {
                    go : function() {
                        StorageDataService.setParam('paymentObj', null);
                        var code = StorageDataService.getParam('toAddBankCode');
                        StorageDataService.setParam('toAddBankCode', null);
                        switch(code){
                            case 1:
                                $state.go('paylist');
                                break;
                            case 2:
                                $state.go('paylist');
                                break;
                            case 3:
                                $state.go('paylist');
                                break;
                            case 4:
                                $state.go('paylist');
                                break;
                            case 5://支付和缴纳保证金直接进入添卡失败关闭当前页面
                                NirvanaUtil.doBack(0);
                                break;
                            case 8://支付和缴纳保证金直接进入添卡失败关闭当前页面
                                NirvanaUtil.doBack(0);
                                break;
                            case 7:
                                $state.go('withholding');
                                break;
                            case 11://支付安全进入到实名认证完成后返回支付安全主页
                                $state.go('securityHome');
                                break;
                            case 12://进入丰海贷
                                window.location.href = $rootScope.forwardUrl;
                                break;
                            default:
                                $state.go('bind');
                        }
                    }
                };
            }])
    

});