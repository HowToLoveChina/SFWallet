/**
 * Created by SF on 8/3/16.
 */
/**
 * Created by SF on 7/8/16.
 */

define(function (require) {
    var app = require("../app");
    require("../factory/BankCard");
    require("../factory/verify");
    require("../directive/directiveScroll");
    app
        //hash:bankcardAdd
        .controller('BankCardAddCtrl', ['$scope', '$rootScope', '$state', 'NirvanaUtil', 'IDCard', 'Toast',  'queryBankListService', 'bankCardQueryService', '$timeout','queryWithholdType', 'certTypeListQuery', 'StorageDataService', 'validateCertExistsService',
            function ($scope, $rootScope, $state, NirvanaUtil, IDCard, Toast, queryBankListService, bankCardQueryService, $timeout,queryWithholdType, certTypeListQuery, StorageDataService, validateCertExistsService) {
                $scope.code = StorageDataService.getParam('toAddBankCode');
                $scope.goBack = function () {

                    var code = StorageDataService.getParam('toAddBankCode');
                    switch (code){
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 6:
                        case 7:
                        case 11:
                        case 13:
                            window.history.back();
                            break;
                        case 14:
                            window.history.back();
                            break;
                        case 5:
                        case 8:
                            NirvanaUtil.doBack(0);
                            break;
                        case 12:
                            window.location.replace($rootScope.forwardUrl);
                            break;
                        default:
                            $state.go('bind');
                            break;


                    }
                    // if (code == 1 || code == 2 || code == 3 || code == 4 || code == 6 || code == 7 || code == 11||code==117) {
                    //     window.history.back();
                    // } else if (code == 5 || code == 8) {//缴纳保证金和支付发现未添卡时进入添卡页面返回关闭
                    //     NirvanaUtil.doBack(0);
                    // } else if (code == 12) {//丰海贷接入添卡
                    //     window.location.replace($rootScope.forwardUrl);
                    // } else {
                    //     $state.go('bind');
                    // }
                };
                //响应android物理返回键(众包)
                window.doKeyBack = function () {
                    if ($scope.showScroll || $scope.showList) {//open
                        $scope.showScroll = false;
                        $scope.cancel();
                        $scope.$apply();
                    } else {//close
                        $scope.goBack();
                    }
                };
                //响应android物理返回键(顺手付)
                window.onBack = function(){
                    window.doKeyBack();
                };

                $scope.obj = {
                    userName: "",//姓名
                    certType: null,//证件类型
                    certNumber: "",//身份证号
                    bankcardNumber: ""//银行卡号
                };

                var isRegister = 'N';

                //取缓存数据
                var p = null;
                var _p = sessionStorage.addCard_params;
                if (_p != null && _p != 'undefined') {
                    p = JSON.parse(_p);
                }
                if (p != null && $rootScope.notWithholdSign == '') {
                    $scope.obj.userName = p.userName;
                    $scope.obj.certNumber = p.certNumber;
                    $scope.obj.bankcardNumber = p.bankcardNumber;
                    $scope.obj.certType = p.certType;
                    $rootScope.notWithholdSign = p.notWithholdSign;
                    isRegister = p.isRegister;
                }

                var notWithholdSign = $rootScope.notWithholdSign;//从支付列表进入添加银行卡，不需要开通代扣协议

                //该接口用于代扣签约扣款方式的查询，主要有如下三种：卡、余额、卡和余额。
                var withholdType = queryWithholdType;
                if (withholdType.data.rltCode == '00' && withholdType.data.data) {
                    var withholdTypeResult = NirvanaUtil.decryptRespone(withholdType.data.data, withholdType.data.responseTime);
                    $rootScope.contractType = withholdTypeResult.contractType;//扣款类型，BALANCE：余额 BANKCARD：银行卡 ALL：余额和银行卡
                    if ($rootScope.contractType == 'BALANCE') {//余额代扣
                        notWithholdSign = 'Y';//不开通代扣协议的绑卡
                        var memberFlag = StorageDataService.getBindDateByKey('memberFlag');
                        if (memberFlag == '3') {//未绑储蓄卡(已实名)
                            $state.go('withholding');//不需要绑卡，直接去开通余额代扣协议(屏蔽银行卡)。
                        }
                    }
                    //区别同城配商户，有memberType这个值说明不是同城配过来，1027新添加的入口
                    //if($rootScope.memberType){
                    //    $rootScope.contractType = $rootScope.memberType;
                    //}
                } else {
                    //Toast.show(withholdType.data.rltMsg);
                }

                //是否已经实名true:实名false:未实名
                $scope.isRealName = false;
                /* 证件信息扩展字段标志
                 *  Y：前端需要收集证件信息的扩展字段
                 *  N：前端不用收集证件信息的扩展字段
                 */
                var certExtFlag = "Y";
                /**
                 *证件类型(code、message)
                 *如果已经实名，里面只有一条记录
                 *如果未实名，里面有所有支持的证件类型列表记录
                 **/
                $scope.certTypesList = [];
                /**
                 * 绑卡查询支持的证件类型接口
                 */
                if (certTypeListQuery.data.rltCode == '00' && certTypeListQuery.data.data) {
                    var certTypeListQueryResult = NirvanaUtil.decryptRespone(certTypeListQuery.data.data, certTypeListQuery.data.responseTime);
                    $scope.obj.certType = certTypeListQueryResult.certTypes[0];
                    //是否已经实名Y:实名N:未实名
                    $scope.isRealName = certTypeListQueryResult.isRealName == 'Y';
                    if ($scope.isRealName) {
                        $scope.obj.userName = certTypeListQueryResult.memberName;
                    } else {
                        $scope.certTypesList = [];
                        for (var i = 0; i < certTypeListQueryResult.certTypes.length; i++) {
                            $scope.certTypesList.push({
                                value: certTypeListQueryResult.certTypes[i].code,
                                text: certTypeListQueryResult.certTypes[i].message
                            });
                        }
                        $scope.scrollList = $scope.certTypesList;
                    }
                    //证件信息扩展字段标志
                    //Y：前端需要收集证件信息的扩展字段
                    //N：前端不用收集证件信息的扩展字段
                    certExtFlag = certTypeListQueryResult.certExtFlag;
                } else {
                    Toast.show(certTypeListQuery.data.rltMsg);
                }

                //证件类型选择相关操作
                $scope.certTypeLabel = "证件号码";

                //点击确定，关闭证件类型列表
                $scope.showCertType = function () {
                    if (!$scope.obj.certType) return;
                    var code = $scope.obj.certType.code;
                    for (var i = 0; i < $scope.certTypesList.length; i++) {
                        if ($scope.certTypesList[i].value == code) {
                            $scope.certTypeMessage = $scope.certTypesList[i].text;
                            $scope.obj.certType.message = $scope.certTypesList[i].text;
                            break;
                        }
                    }
                    if (code == "SFZ" || code == 'I_CARD') {
                        $scope.certTypeLabel = "身份证号";
                    } else if (code == "PASSPORT_HK" || code == "HK_M_PASS") {
                        $scope.certTypeLabel = "通行证号";
                    } else if (code == "PASSPORT_MC") {
                        $scope.certTypeLabel = "通行证号";
                    } else if (code == "PASSPORT_TW") {
                        $scope.certTypeLabel = "通行证号";
                    } else if (code == "PASSPORT") {
                        $scope.certTypeLabel = "护照号码";
                    } else {
                        $scope.certTypeLabel = "证件号码";
                    }
                };
                $scope.showCertType();
                //显示证件类型控件
                $scope.open = function () {
                    $scope.showScroll = true;
                };
                $scope.$watch('scrollResult',function(newVal){
                    if(!newVal) return;
                    $scope.obj.certType.code = newVal['value'];
                    $scope.showCertType();
                });

                var bankModel;
                //支持的银行卡列表(可选择)
                //储蓄卡
                $scope.debits1 = [];

                //信用卡
                $scope.credits1 = [];
                /**
                 * 识别银行卡
                 * 根据银行卡号查询匹配该银行卡签约要素，如果没有没匹配成功，则返回系统支持的所有的银行签约要素
                 */
                $scope.queryCardType = function () {

                    $timeout(function () {
                        var cardNo = $scope.obj.bankcardNumber;
                        if (cardNo == null || cardNo.length < 8) {
                            $scope.cardType = '请选择卡类型';
                            return;
                        }
                        if (!/^[0-9]*$/.test(cardNo)) {
                            Toast.show("银行卡号必须为纯数字！");
                            $scope.cardType = '请选择卡类型';
                            return;
                        }
                        bankCardQueryService.query(cardNo, $scope.isRealName?'Y':'N').
                        success(function (response, status, headers, config) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00' && response.data) {
                                var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                /**
                                 * 如果已经识别出（isDisting为Y），则返回该行签约要素
                                 * 如果未识别出（isDisting为N），则返回支持所有银行的签约要素集合
                                 */
                                $scope.isDisting = result.isDisting;
                                if ($scope.isDisting == "Y") {
                                    bankModel = result.banks[0];
                                    showCardType(result.banks[0]);
                                } else {
                                    $scope.debits1 = [];//防止重复往数组中添加元素
                                    $scope.credits1 = [];
                                    $scope.hasCredits = false;
                                    var bankList = result.banks;
                                    for (var i = 0; i < bankList.length; i++) {
                                        if (bankList[i].cardType == 'DEBIT') {
                                            $scope.debits1.push(bankList[i]);
                                        } else if (bankList[i].cardType == 'CREDIT') {
                                            $scope.credits1.push(bankList[i]);
                                            $scope.hasCredits = true;
                                        }
                                    }
                                }
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            } else {
                                Toast.show(response.rltMsg);
                            }
                        }).
                        error(function (response, status, headers, config) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                        });
                    }, 200);
                };
                $scope.queryCardType();
                //解决剩下7位后仍显示为初次识别的银行
                $scope.$watch('obj.bankcardNumber',function(newVal, oldVal){
                    if(newVal && newVal.length < 8){
                        $scope.cardType = '请选择卡类型';
                    }
                    if(oldVal && oldVal.length < 8){
                        $scope.cardType = '请选择卡类型';
                    }
                });

                $scope.cardType = '请选择卡类型';
                //显示能识别的银行卡
                function showCardType(bankModel) {
                    if (bankModel == null || bankModel == undefined) {
                        $scope.isDisting = "N";
                        return;
                    }
                    var cardTypeName = '';
                    if (bankModel.cardType == 'DEBIT') {//储蓄卡
                        cardTypeName = '储蓄卡';
                    } else if (bankModel.cardType == 'CREDIT') {//信用卡
                        cardTypeName = '信用卡';
                    }

                    $scope.cardType = bankModel.bankName + " " + cardTypeName;
                }

                $scope.cardList = [];

                //列表 是否显示
                $scope.showList = false;
                //1、显示银行卡类型列表，2、显示支持银行列表
                $scope.showType = 1;
                $scope.isWx = false;//非微信
                var ua = window.navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == 'micromessenger') {//微信的时候要隐藏标题
                    $scope.isWx = true;
                }
                $scope.showCardList = function (type) {
                    $scope.showType = type;
                    if (type == 1) {//银行卡类型列表
                        if($scope.obj.bankcardNumber == null || $scope.obj.bankcardNumber.length < 8 || $scope.isDisting == "Y"){
                            return ;
                        }
                        $scope.listTitle = "选择银行卡类型";
                        $scope.cardList = $scope.debits1;
                    }else if(type == 2){//支持的银行列表
                        $scope.listTitle = "支持银行卡";
                        $scope.cardList = $scope.debits2;
                    }

                    var t=setTimeout(function () {
                        var input= $('input[type=text],input[type=tel]').blur();
                        $scope.showList = true;
                        $scope.$apply();
                        clearTimeout(t);
                    },800);
                   
                };
                $scope.showCardType = 'debits';//默认显示储蓄卡
                $scope.setCardType = function(cardType){
                    $scope.showCardType = cardType;
                    if(cardType == 'debits'){
                        if ($scope.showType == 1) {//储蓄卡类型列表
                            $scope.cardList = $scope.debits1;
                        }else if($scope.showType == 2){//支持的银行列表
                            $scope.cardList = $scope.debits2;
                        }
                    }else if(cardType == 'credits'){
                        if ($scope.showType == 1) {//信用卡类型列表
                            $scope.cardList = $scope.credits1;
                        }else if($scope.showType == 2){//支持的银行列表
                            $scope.cardList = $scope.credits2;
                        }
                    }
                };
                $scope.getSelectedBank = function(index){
                    if($scope.showType == 2){//支持的银行卡列表不需要有选择item事件
                        return;
                    }
                    if($scope.showCardType == 'debits'){
                        $scope.getSelectedDebitBank(index);
                    }else if($scope.showCardType == 'credits'){
                        $scope.getSelectedCreditBank(index);
                    }
                };
                //选择储蓄卡
                $scope.getSelectedDebitBank = function (index) {
                    bankModel = $scope.debits1[index];
                    $scope.cancel();
                    showCardType(bankModel);
                };
                //选择信用卡
                $scope.getSelectedCreditBank = function (index) {
                    bankModel = $scope.credits1[index];
                    $scope.cancel();
                    showCardType(bankModel);
                };

                //支持的银行卡列表(不可选择)
                //储蓄卡
                $scope.debits2 = [];
                //信用卡
                $scope.credits2 = [];

                //(仅供查看列表)不可选择
                (function getSupportBankList() {
                    $rootScope.loading = true;
                    queryBankListService.query($scope.isRealName?'Y':'N').
                    success(
                        function (response, status, headers, config) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                            if (response.rltCode == '00' && response.data) {
                                var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                $scope.debits2 = res.debits;
                                $scope.credits2 = res.credits;
                                $scope.hasCredits = $scope.credits2.length > 0;
                            }
                        }).
                    error(function (response, status, headers, config) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
                })();

                $scope.cancel = function(){
                    $scope.showList = false;
                };

                //下一步
                $scope.next = function () {
                    //银行卡号校验
                    var cardNo = $scope.obj.bankcardNumber
                    if (cardNo == null || cardNo.length < 8) {
                        Toast.show("请输入正确的银行卡号！");
                        return;
                    }
                    if (!/^[0-9]*$/.test(cardNo)) {
                        Toast.show("银行卡号必须为纯数字！");
                        return;
                    }
                    var certNo = $scope.obj.certNumber.replace(/[ ]/g, "");
                    var code = $scope.obj.certType.code;
                    if (!$scope.isRealName && (code == "SFZ" || code == 'I_CARD')) {
                        var idCardVaild = IDCard.valid(certNo);
                        if (idCardVaild != "0") {
                            Toast.show(idCardVaild);
                            return;
                        }
                    }

                    if (bankModel == null || bankModel == undefined) {
                        Toast.show("请选择银行卡类型！");
                        return;
                    }
                    //不支持信用卡，用户输入的卡号通过识别出了是信用卡
                    if (bankModel.cardType == 'CREDIT' && $scope.credits1.length == 0) {
                        Toast.show("暂不支持信用卡！");
                        return;
                    }
                    //TODO 由于后台证件code没有统一，暂时不验证证件号是否存在
                    if (!$scope.isRealName) {
                        $rootScope.loading = true;
                        validateCertExistsService.query(certNo, code).
                        success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00' && response.data) {
                                var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                var isExist = res.isExist;
                                if ('1' == isExist) {
                                    Toast.show("该证件号已存在！");
                                } else {
                                    goBankCardInfo();
                                }
                            } else {
                                Toast.show(response.rltMsg);
                            }
                        }).error(function (response) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                        });
                    } else {
                        goBankCardInfo();
                    }
                };

                function goBankCardInfo() {
                    var params = {
                        userName: $scope.obj.userName,//姓名
                        certNumber: $scope.obj.certNumber,//证件号
                        certType: $scope.obj.certType,
                        bankModel: bankModel,
                        bankcardNumber: $scope.obj.bankcardNumber,//银行卡号
                        notWithholdSign: notWithholdSign,
                        isRegister: $rootScope.isRegister
                    };

                    //缓存参数
                    sessionStorage.addCard_params = JSON.stringify(params);
                    sessionStorage.certExtFlag = certExtFlag;

                    if ($scope.isRealName) {//实名添卡
                        $rootScope.params_bankcardInfo2 = params;
                        $state.go("bankcardInfo2");
                    } else {
                        if (certExtFlag == 'N') {
                            $rootScope.params_bankcardInfo2 = params;
                            $state.go("bankcardInfo2");
                        } else {//去填写住址等信息
                            $rootScope.params_bankcardInfo = params;
                            $state.go("bankcardInfo");
                        }
                    }
                }

            }])
});