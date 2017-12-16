/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
    app
    //添卡完成的分发(绑定成功都走完成界面)
        .factory('addBankCardSuccessRoute', ['$state', '$rootScope', 'StorageDataService', 'NirvanaUtil',
            function($state, $rootScope, StorageDataService, NirvanaUtil) {
                return {
                    go : function(params) {
                        $rootScope.newBankCardModel = params.payment;
                        StorageDataService.setParam('paymentObj', params.payment);
                        var code = StorageDataService.getParam('toAddBankCode');
                        StorageDataService.setParam('toAddBankCode', null);
                        switch(code){
                            case 1:
                                $state.go('walletRecharge');
                                break;
                            case 2:
                                $state.go('walletCash');
                                break;
                            case 3:
                                $state.go('depositSure');
                                break;
                            case 4:
                                $state.go('pay');
                                break;
                            case 5:
                                $state.go('depositSure');
                                break;
                            case 8:
                                $state.go('pay');
                                break;
                            case 7://开通代扣添加银行卡
                                // NirvanaUtil.doBack(1);
                                $state.go('bindSuccess');
                                break;
                            case 6://更换代扣银行卡进入添卡
                                $state.go('withholdingSwitch');
                                break;
                            case 11://支付安全进入到实名认证完成后返回支付安全主页
                                $state.go('securityHome');
                                break;
                            case 12://进入丰海贷
                                window.location.href = $rootScope.forwardUrl;
                                break;
                            default:
                                $state.go('bindSuccess');
                        }
                    }
                };
            }])
    
    
});