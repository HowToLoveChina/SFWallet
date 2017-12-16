define(['require', 'app'], function (require, app) {
    app
        .factory('passwordService', ['Toast', function (Toast) {
            return {
                check: function (oldPassword, newPassword) {
                    if (!/^\d{6}$/.test(oldPassword) || !/^\d{6}$/.test(newPassword)) {
                        Toast.show('支付密码为六位纯数字');
                        return -1;
                    }

                    // 验证两次支付密码是否一致
                    if (oldPassword != newPassword) {
                        Toast.show('您输入的支付密码和确认支付密码不一致');
                        return -1;
                    }

                    // 不能包含有连续四位及以上顺序(或逆序)数字或字母；（如：1234、abcd等）
                    var asc = 1;// 升序
                    var desc = 1;// 降序
                    var validateState = false;
                    var lastChar = oldPassword.charAt(0).charCodeAt();
                    for (var i = 1; i < oldPassword.length; i++) {
                        var char_ = oldPassword.charAt(i).charCodeAt();
                        if (!/[0-9a-zA-Z]/i.test(oldPassword.charAt(i))) {
                            asc = 0;
                            desc = 0;
                        } else if (lastChar == char_ - 1) {
                            asc++;
                            desc = 1;
                        } else if (lastChar == char_ + 1) {
                            desc++;
                            asc = 1;
                        } else {
                            asc = 1;
                            desc = 1;
                        }
                        if (asc >= 4 || desc >= 4) {
                            validateState = true;
                            break;
                        }
                        lastChar = char_;
                    }

                    if (validateState) {
                        Toast.show("输入的支付密码不能包含有连续4位及以上顺序（或逆序）数字");
                        return -1;
                    }

                    // 密码中不能包含有连续四位及以上重复字符，字母不区分大小写；（如：8888、AAAA、$$$$等）
                    if (/(.)\1{3,}/ig.test(oldPassword)) {
                        Toast.show("输入的支付密码不能包含有连续4位及以上重复数字");
                        return -1;
                    }

                    return 0;
                }
            }
        }])
        .factory('IDCard', [function () {
            return {
                valid: function (idcard) {
                    var ereg = "^((11|12|13|14|15|21|22|23|31|32|33|34|35|36|37|41|42|43|44|45|46|50|51|52|53|54|61|62|63|64|65|71|81|82|91)\\d{4})((((19|20)(([02468][048])|([13579][26]))0229))|((20[0-9][0-9])|(19[0-9][0-9]))((((0[1-9])|(1[0-2]))((0[1-9])|(1\\d)|(2[0-8])))|((((0[1,3-9])|(1[0-2]))(29|30))|(((0[13578])|(1[02]))31))))((\\d{3}(x|X))|(\\d{4}))$";
                    var patt1 = new RegExp(ereg);
                    if (patt1.test(idcard)) {
                        return "0";
                    } else {
                        return "请输入正确的身份证号";
                    }
                }
            }
        }])
//比较两个日期大小
        .factory('sfPayDate', [function () {
            return {
                compare: function (date1, date2) {
                    if (date1 == null || date2 == null) {
                        return -1;
                    }
                    date1 = date1.replace(/\-/gi, "/");
                    date2 = date2.replace(/\-/gi, "/");
                    var time1 = new Date(date1).getTime();
                    var time2 = new Date(date2).getTime();
                    if (time1 > time2) {
                        return 1;
                    } else if (time1 == time2) {
                        return 2;
                    } else {
                        return 3;
                    }
                },
                getNowDate: function () {
                    var date = new Date();
                    var seperator1 = "-";
                    var seperator2 = ":";
                    var month = date.getMonth() + 1;
                    var strDate = date.getDate();
                    if (month >= 1 && month <= 9) {
                        month = "0" + month;
                    }
                    if (strDate >= 0 && strDate <= 9) {
                        strDate = "0" + strDate;
                    }
                    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
                        + " " + date.getHours() + seperator2 + date.getMinutes()
                        + seperator2 + date.getSeconds();
                    return currentdate;
                }
            }
        }])
    /**
     * 校验表单所有输入域是否含有特殊符号
     * 所要过滤的符号写入正则表达式中，注意，一些符号要用'\'转义.
     */
        .factory('formTextValid', ['Toast', function (Toast) {
            return {
                check: function (form) {
                    //记录不含引号的文本框数量
                    var resultTag = 0;
                    //记录所有text文本框数量
                    var flag = 0;
                    for (var i = 0; i < form.elements.length; i++) {
                        if (form.elements[i].type == "text") {
                            flag = flag + 1;
                            //此处填写所要过滤的特殊符号
                            //注意：修改####处的字符，其它部分不许修改.
                            //if(/^[^####]*$/.test(form.elements[i].value))

                            if (/^[^\|"'<>]*$/.test(form.elements[i].value))
                                resultTag = resultTag + 1;
                            else
                                form.elements[i].select();
                        }
                    }
                    /**
                     * 如果含引号的文本框等于全部文本框的值，则校验通过
                     */
                    if (resultTag == flag)
                        return true;
                    else {
                        Toast.show("文本框中不能含有<br />1 单引号: ' <br />2 双引号: \" <br />3 竖&nbsp&nbsp&nbsp&nbsp&nbsp杠: | <br />4 尖角号: <>");
                        return false;
                    }
                }
            };
        }])
//添卡完成的分发(绑定成功都走完成界面)
        .factory('addBankCardSuccessRoute', ['$state', '$rootScope', 'StorageDataService', 'NirvanaUtil',
            function ($state, $rootScope, StorageDataService, NirvanaUtil) {
                return {
                    go: function (params) {
                        $rootScope.isRealName = 'Y';//添卡成功后标示置为Y，首页显示已实名状态
                        $rootScope.newBankCardModel = params.payment;
                        StorageDataService.setParam('paymentObj', params.payment);
                        var code = StorageDataService.getParam('toAddBankCode');
                        StorageDataService.setParam('toAddBankCode', null);
                        switch (code) {
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
                                $rootScope.securityHomeSucess = true;//微信返回按钮控制
                                $state.go('securityHome');
                                break;
                            case 12://进入丰海贷
                                window.location.replace($rootScope.forwardUrl);
                                break;
                            case 13://进入钱包首页
                                $state.go('wallet');
                                break;
                            case 14://进入银行卡列表
                                $rootScope.bankListSucess = true;//微信返回按钮控制
                                $state.go('bankList');
                                break;
                            default:
                                $state.go('bindSuccess');
                        }
                    }
                };
            }])
//前端签约失败
        .factory('addBankCardFailRoute', ['$rootScope', 'NirvanaUtil', '$state', 'StorageDataService',
            function ($rootScope, NirvanaUtil, $state, StorageDataService) {
                return {
                    go: function () {
                        StorageDataService.setParam('paymentObj', null);
                        var code = StorageDataService.getParam('toAddBankCode');
                        StorageDataService.setParam('toAddBankCode', null);
                        switch (code) {
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
                                window.location.replace($rootScope.forwardUrl);
                                break;
                            case 13://进入钱包首页
                                $state.go('wallet');
                                break;
                            case 14://进入银行卡列表
                                $state.go('bankList');
                                break;
                            default:
                                $state.go('bind');
                        }
                    }
                };
            }])
//进入忘记支付密码，找回支付密码后的路由
        .factory('foundPayPwdSuccessRoute', ['$state', 'StorageDataService', 'NirvanaUtil',
            function ($state, StorageDataService, NirvanaUtil) {
                return {
                    go: function () {
                        var statusCode = StorageDataService.getParam('toGetPwdCode');
                        if (statusCode == 1) {//
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go("inputpwd");
                        } else if (statusCode == 2) {//
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go("depositSure");
                        } else if (statusCode == 3) {//
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go("pay");
                        } else if (statusCode == 4) {//更换代扣银行卡中输入支付密码界面中的找回支付密码
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go("withholdInputPayPwd");
                        } else if (statusCode == 5) {//跳回支付安全页面
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go("securityHome");
                        } else if (statusCode == 6) {//跳回更换手机号页面
                            StorageDataService.setParam('toGetPwdCode', 0);
                            $state.go('account');
                        } else {
                            NirvanaUtil.doBack(0);
                        }
                    }
                };
            }])
//根据用户输入的帐户，进行分发
//1-会员未注册   2-未实名、3-未绑储蓄卡(实名)、4-未开通代扣绑定、5-已开通代扣绑定、6-已经注册未设置支付密码
        .factory('bindRoute', ['$rootScope', '$state', 'StorageDataService',
            function ($rootScope, $state, StorageDataService) {
                return {
                    go: function () {
                        var memberFlag = StorageDataService.getBindDateByKey('memberFlag');
                        var mobile = StorageDataService.getBindDateByKey('phoneNumber');
                        switch (memberFlag) {
                            case '1':
                                //if(扣款类型!=余额(BALANCE))productCode=251;
                                StorageDataService.setParam('toAddBankCode', 99);
                                $rootScope.params_bindSetPayPwd = {
                                    'mobile': mobile, "isRegister": "Y"
                                }
                                $state.go("bindSetPayPwd");
                                break;
                            case '2':
                                //if(扣款类型!=余额(BALANCE))productCode=251;
                                StorageDataService.setParam('toAddBankCode', 99);
                                $state.go("bankcardAdd");//未实名添卡
                                break;
                            case '3':
                                //if(扣款类型==余额(BALANCE)){go('withholding'),余额代扣界面，屏蔽银行卡}else{go(bankcardAdd);productCode=251;绑卡并代扣签约}
                                StorageDataService.setParam('toAddBankCode', 99);
                                $state.go("bankcardAdd");//实名添卡
                                break;
                            case '4':
                                //不需要屏蔽银行卡
                                $state.go("withholding");//已经实名绑卡，但未开通代扣协议
                                break;
                            case '5':
                                $state.go("bindSuccess");//已经绑卡，已经开通协议，直接完成绑定
                                break;
                            case '6':
                                $rootScope.params_bindSetPayPwd = {
                                    'mobile': mobile, "isRegister": "N_RESETPAYPWD"
                                }
                                $state.go("bindSetPayPwd");
                                break;
                        }
                    }
                };
            }]);

});