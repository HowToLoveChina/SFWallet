/**
 * Created by SF on 7/8/16.
 */

define(function (require) {
    var app = require("../app");
    require("../factory/BankCard");
    require("../factory/verify");
    require("../factory/pageSlide");
    require("../factory/WithholdService");
    require("../factory/countryList");
    require("../factory/sendPaySmsService");
    require("../factory/VerifyCodeService");
    require("../directive/directive");
    require("../directive/directiveDate");
    require("../directive/directiveScroll");
    require("../factory/dynamicFieldsParseService");
    require("filter");
    require("$");
    require("cityJ");
    require("cityP");
    require("cityS");

    app
        //hash:bankcardAdd
        .controller('BankCardInfoCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$compile', '$document', 'sfPayDate', 'formTextValid', 'pageSlide', 'countryList', function ($scope, $rootScope, $state, $timeout, $compile, $document, sfPayDate, formTextValid, pageSlide, countryList) {
            $scope.goBack = function () {
                window.history.back();
            };
            window.doKeyBack = function () {
                if ($scope.showDateScroll || $scope.showScroll) {//open
                    $scope.showDateScroll = false;
                    $scope.showScroll = false;
                    $scope.$apply();
                } else if ($('#PoPy').attr('align') == 'left') {//open
                    $('#PoPx').remove();
                    $('#PoPy').remove();
                } else {
                    $scope.goBack();
                }
            };
            //响应android物理返回键(顺手付)
            window.onBack = function(){
                window.doKeyBack();
            };

            var userName;
            var certNumber;
            var certType;
            var bankModel;
            var bankcardNumber;
            var notWithholdSign;

            $scope.obj = {
                userName: '',
                certNumber: '',
                certType: null,
                startDate: '',
                endDate: '',
                country: '',//国籍
                sex: '',//性别
                staff: '',
                curAddress: '',
                detailAddress: ''
            };

            //取缓存数据
            var p = null;
            var _p = sessionStorage.bankCardInfo_params;
            if (_p != null && _p != 'undefined') {
                p = JSON.parse(_p);
            }
            if (p != null && $rootScope.params_bankcardInfo == null) {
                notWithholdSign = p.notWithholdSign;
                userName = $scope.obj.userName = p.userName;
                certNumber = $scope.obj.certNumber = p.certNumber;
                certType = $scope.obj.certType = p.certType;
                bankModel = p.bankModel;
                bankcardNumber = p.bankcardNumber;
                $scope.obj.startDate = p.startDate;
                $scope.obj.endDate = p.endDate;
                $scope.obj.staff = p.staff;
                $scope.obj.curAddress = '';
                $scope.obj.detailAddress = p.detailAddress;
            } else {
                userName = $scope.obj.userName = $rootScope.params_bankcardInfo.userName;
                certNumber = $scope.obj.certNumber = $rootScope.params_bankcardInfo.certNumber;
                certType = $scope.obj.certType = $rootScope.params_bankcardInfo.certType;
                bankModel = $rootScope.params_bankcardInfo.bankModel;
                bankcardNumber = $rootScope.params_bankcardInfo.bankcardNumber;
                notWithholdSign = $rootScope.params_bankcardInfo.notWithholdSign;
            }
            $scope.result=2;
            //打开日期滚动控件
            $scope.openDateScroll = function (t) {
                var timer = $timeout(function () {
                    $('input[type=text],input[type=tel]').blur();
                    $scope.showDateScroll = true;
                    $scope.showDateScrollType = t;
                    clearTimeout(timer);
                }, 800);
            };

            //打开国籍列表
            $scope.openCountryList = function () {
                $scope.showList = true;
            };
            //关闭层
            $scope.cancel = function () {
                $scope.showList = false;
            };

            //国籍选择
            var data = countryList.query();
            $scope.countrys = {};
            $scope.countrys.A = data[0];
            $scope.countrys.B = data[1];
            $scope.countrys.C = data[2];
            $scope.countrys.D = data[3];
            $scope.countrys.E = data[4];
            $scope.countrys.F = data[5];
            $scope.countrys.G = data[6];
            $scope.countrys.H = data[7];
            $scope.countrys.I = data[8];
            $scope.countrys.J = data[9];
            $scope.countrys.K = data[10];
            $scope.countrys.L = data[11];
            $scope.countrys.M = data[12];
            $scope.countrys.N = data[13];
            $scope.countrys.O = data[14];
            $scope.countrys.P = data[15];
            $scope.countrys.Q = data[16];
            $scope.countrys.R = data[17];
            $scope.countrys.S = data[18];
            $scope.countrys.T = data[19];
            $scope.countrys.U = data[20];
            $scope.countrys.V = data[21];
            $scope.countrys.W = {};
            $scope.countrys.X = {};
            $scope.countrys.Y = data[22];
            $scope.countrys.Z = data[23];

            //选择国家
            $('body').on('click', '#countryList .list-box p', function () {
                $('#searchKey').val($(this).html()).attr('data-id', $(this).attr('data-id'));
                $scope.obj.country = $(this).html();
                $scope.cancel();
                $scope.$apply();
            });
            $('.letter a').click(function () {
                var s = $(this).html();
                $(window).scrollTop($('#' + s + '1').offset().top);
            });

            $scope.searchResult = [];

            $scope.searchKey = "";
            //按关键字搜索国籍
            $scope.search = function () {
                var key = $scope.searchKey;
                if (key == null || key == "") {
                    $('#countryListDiv').show();
                    $('.letter').show();
                    $("#searchResultList").hide();
                    $("#searchResultList").removeClass("country-height");
                    return;
                }
                $scope.searchResult.length = 0;//清空结果
                for (var k in $scope.countrys) {
                    for (var i = 0; i < $scope.countrys[k].length; i++) {
                        if ($scope.countrys[k][i].indexOf(key) > -1) {
                            $('#countryListDiv').hide();
                            $('.letter').hide();
                            $("#searchResultList").show();
                            $("#searchResultList").addClass("country-height");
                            $scope.searchResult.push($scope.countrys[k][i]);
                        }
                    }
                }
            }

            $scope.canSelectCountry = true;//选择了身份证、通行证就不能再选国籍
            $scope.canSelectSex = true;//选择了身份证就不能再选性别
            $scope.certTypeMessage = "";//显示证件标签

            if (certType.code == "SFZ" || certType.code == 'I_CARD') {
                $scope.canSelectCountry = false;
                $scope.canSelectSex = false;
                $scope.certTypeMessage = "身份证号";
                $scope.obj.country = "中国";

                var sexFlag = certNumber.substr(16, 1);
                if (sexFlag % 2 == 0) {
                    $scope.obj.sex = "女";
                } else {
                    $scope.obj.sex = "男";
                }
            } else if (certType.code == "PASSPORT_HK" || certType.code == "HK_M_PASS") {
                $scope.canSelectCountry = false;
                $scope.canSelectSex = true;
                $scope.certTypeMessage = "通行证号";
                $scope.obj.country = "中国香港";
            } else if (certType.code == "PASSPORT_MC") {
                $scope.canSelectCountry = false;
                $scope.canSelectSex = true;
                $scope.certTypeMessage = "通行证号";
                $scope.obj.country = "中国澳门";
            } else if (certType.code == "PASSPORT_TW") {
                $scope.canSelectCountry = false;
                $scope.canSelectSex = true;
                $scope.certTypeMessage = "通行证号";
                $scope.obj.country = "中国台湾";
            } else if (certType.code == "PASSPORT") {
                $scope.canSelectCountry = true;
                $scope.canSelectSex = true;
                $scope.certTypeMessage = "护照号码";
            }

            //性别
            var sexs = ["男", "女"];

            //职业列表
            var staffs = ["计算机/互联网/通信/电子 ", "销售/客服/技术支持 ", "会计/金融/银行/保险", "生产/营运/采购/物流 ", "医药", "广告/市场/媒体/艺术", "建筑/房地产", "人事/行政/高级管理", "咨询/法律/教育/科研", "服务业", "学生/公务员/翻译", "其他"];
            $scope.obj.staff = staffs[0];

            //滚动控件选择相关操作
            var sexORstaff;
            $scope.open = function (type) {
                sexORstaff = type;
                $scope.showScroll = true;
                $scope.scrollList = [];
                if (type == 'SEX') {
                    for (var i = 0; i < 2; i++) {
                        $scope.scrollList.push({value: sexs[i], text: sexs[i]});
                    }
                } else if (type == 'STAFF') {
                    for (var i = 0; i < 12; i++) {
                        $scope.scrollList.push({value: staffs[i], text: staffs[i]});
                    }
                }
            };
            $scope.scrollResult = '';
            $scope.$watch('scrollResult', function (newVal) {
                if(!newVal) return;
                if (sexORstaff == 'SEX') {
                    $scope.obj.sex = newVal['value'];
                } else if (sexORstaff == 'STAFF') {
                    $scope.obj.staff = newVal['value'];
                }
            });

            //选择省市区
            $("#city").click(function (e) {
                SelCity(this, e);
                $("#PoPy").css({"left": "0px", "top": "45px", "width": "100%", "background": "#fff"});
                $scope.obj.curAddress = "有值了就可以了";
                $scope.$apply();
            });

            function bbAlert(message) {
                message = message.replace(/\s+/g, "");
                var bbBox = $compile('<bb-alert msg=' + message + '></bb-alert>')($scope);
                $document.find('body').append(bbBox);
            }

            $scope.next = function () {
                //证件有效期验证
                var d1 = $scope.obj.startDate;
                var d2 = $scope.obj.endDate;
                var today = sfPayDate.getNowDate();

                var r = sfPayDate.compare(today, d1);
                if (r == 3) {
                    bbAlert('开始时间不能晚于今天！');
                    return;
                }

                if (d2 && d2 != "") {
                    var r1 = sfPayDate.compare(today, d2);
                    if (r1 == 1 || r1 == 2) {
                        bbAlert('结束时间不能早于今天！');
                        return;
                    }
                    var r2 = sfPayDate.compare(d1, d2);
                    if (r2 == 1 || r2 == 2) {
                        bbAlert('开始时间要早于结束时间！');
                        return;
                    }
                }
                //国籍不能为空
                var ct = $scope.obj.country;
                if (ct == null || ct == '') {
                    bbAlert('请选择国籍！');
                    return;
                }
                //性别不能为空
                var sx = $scope.obj.sex;
                if (sx == null || sx == '') {
                    bbAlert('请选择性别！');
                    return;
                }

                var s = $scope.obj.staff;
                if (s == null || s == '') {
                    bbAlert('请选择所处的行业！');
                    return;
                }

                var p = $("#hcity").val();
                var c = $("#hproper").val();
                var area = $("#harea").val();
                if (p == null || p == '') {
                    bbAlert('请选择住址所在省份！');
                    return;
                }
                if (c == null || c == '') {
                    bbAlert('请选择住址所在城市！');
                    return;
                }
                if (area == null || area == '') {
                    bbAlert('请选择住址所在区县！');
                    return;
                }

                //校验所有输入域是否含有特殊符号
                if (!formTextValid.check(document.forms[0])) {
                    return;
                }

                var params = {
                    userName: userName,//姓名
                    certNumber: certNumber,//身份证号
                    bankModel: bankModel,
                    certType: certType,//证件类型
                    bankcardNumber: bankcardNumber,//银行卡号
                    //当前这个界面收集的字段
                    startDate: d1,
                    endDate: d2,
                    country: $scope.obj.country,
                    sex: $scope.obj.sex,
                    staff: $scope.obj.staff,
                    province: $("#hcity").val(),
                    city: $("#hproper").val(),
                    areaCounty: $("#harea").val(),
                    detailAddress: $scope.obj.detailAddress,
                    notWithholdSign: notWithholdSign
                };
                //缓存参数
                sessionStorage.bankCardInfo_params = JSON.stringify(params);

                $rootScope.params_bankcardInfo2 = params;
                $state.go("bankcardInfo2");
            };
        }])
//hash:bankcardInfo2
        .controller('BankCardInfoCtrl2', ['StorageDataService', '$scope', '$rootScope', '$state', 'NirvanaUtil', 'parseService', 'bankCardSignService', 'bankCardWithholdSignService', 'sendSignSmsService', 'pageSlide', 'Toast', function (StorageDataService, $scope, $rootScope, $state, NirvanaUtil, parseService, bankCardSignService, bankCardWithholdSignService, sendSignSmsService, pageSlide, Toast) {
            $scope.goBack = function () {
                window.history.back();
                $scope.cancel();
            };
            window.doKeyBack = function () {
                $scope.goBack();
            };
            //响应android物理返回键(顺手付)
            window.onBack = function(){
                window.doKeyBack();
            };
            var bankModel;
            var bankcardNumber;
            var certType;
            var notWithholdSign;

            $scope.obj = {
                phoneNumber: '',//预留手机号
                accept: true//同意协议
            };

            var p = null;
            var _p = sessionStorage.bankCardInfo2_params;
            if (_p != null && _p != 'undefined') {
                p = JSON.parse(_p);
            }
            if (p != null && $rootScope.params_bankcardInfo2 == null) {
                $scope.obj.phoneNumber = p.phoneNumber;
                $rootScope.params_bankcardInfo2 = p.stateParams;
                $rootScope.params_bankcardInfo2.notWithholdSign = p.notWithholdSign;
            }

            bankModel = $scope.bankModel = $rootScope.params_bankcardInfo2.bankModel;
            bankcardNumber = $scope.bankcardNumber = $rootScope.params_bankcardInfo2.bankcardNumber;//银行卡号
            certType = $rootScope.params_bankcardInfo2.certType;//证件类型
            notWithholdSign = $scope.notWithholdSign = $rootScope.params_bankcardInfo2.notWithholdSign;//从支付列表进入添加银行卡，不需要开通代扣协议

            $scope.isFront = bankModel.isFront == 'Y';
            //设置信用卡有效期的提示信息
            if (bankModel.dynamicFields) {
                for (var i = 0; i < bankModel.dynamicFields.length; i++) {
                    if (bankModel.dynamicFields[i].fieldName == "expDate") {
                        bankModel.dynamicFields[i].placeholder = "月份/年份";
                    }
                }
            }

            //下一步
            $scope.next = function () {
                var _phoneNumber = $scope.obj.phoneNumber;
                if (!/^1\d{10}$/.test(_phoneNumber)) {
                    Toast.show('输入的手机号码不正确！');
                    return;
                }

                if (bankModel.dynamicFields != null && bankModel.dynamicFields != undefined) {
                    var dynamicFieldsJsonText = parseService.dynamicFields(bankModel.dynamicFields, "bankCardInfo2Form");
                    if (dynamicFieldsJsonText == null) {//动态字段输入有误
                        return;
                    }
                }
                var params = {
                    'stateParams': $rootScope.params_bankcardInfo2,
                    'phoneNumber': $scope.obj.phoneNumber,
                    'notWithholdSign': notWithholdSign
                };
                //缓存参数
                sessionStorage.bankCardInfo2_params = JSON.stringify(params);

                if (bankModel.isFront == 'Y') {//去招商银行签约
                    goFrontSign(dynamicFieldsJsonText);
                } else {
                    sendShortMessage(dynamicFieldsJsonText);
                }
            };

            //去前端银行签约
            function goFrontSign(dynamicFieldsJsonText) {
                if (notWithholdSign == 'Y') {
                    $rootScope.loading = true;
                    bankCardSignService.sign($rootScope.params_bankcardInfo2, dynamicFieldsJsonText, $scope.obj.phoneNumber).
                        success(function (response, status, headers, config) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                            if (response.rltCode == '00' && response.data) {
                                var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                //result.payment;//签约成功的银行卡号支付方式, Json字符串
                                $rootScope.params_bankcardInfo3 = {
                                    'url': result.url,
                                    'bankCardNumber': bankcardNumber,
                                    'bankModel': bankModel,
                                    'notWithholdSign': notWithholdSign
                                }
                                $state.go("bankcardInfo3");
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            }
                        }).error(function (response, status, headers, config) {
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                } else {
                    $rootScope.loading = true;
                    bankCardWithholdSignService.sign($rootScope.params_bankcardInfo2, dynamicFieldsJsonText, $scope.obj.phoneNumber).
                        success(function (response, status, headers, config) {
                            $rootScope.loading = false;
                            Toast.show(response.rltMsg);
                            if (response.rltCode == '00' && response.data) {
                                var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                //result.payment;//签约成功的银行卡号支付方式, Json字符串
                                $rootScope.params_bankcardInfo3 = {
                                    'url': result.url,
                                    'bankCardNumber': bankcardNumber,
                                    'bankModel': bankModel,
                                    'notWithholdSign': 'N'
                                }
                                $state.go("bankcardInfo3");
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            }
                        }).error(function (response, status, headers, config) {
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                }
            }

            //发送短信
            function sendShortMessage(dynamicFieldsJsonText) {
                $rootScope.loading = true;
                //自动发短信接口
                sendSignSmsService.send($rootScope.params_bankcardInfo2, dynamicFieldsJsonText, $scope.obj.phoneNumber).
                    success(function (response) {
                        $rootScope.loading = false;
                        if (response.rltCode == 00) {
                            var smsResult = NirvanaUtil.decryptRespone(response.data, response.responseTime);

                            $rootScope.params_bankcardInfo2.phoneNumber = $scope.obj.phoneNumber;//预留手机号
                            $rootScope.params_bankcardInfo2.dynamicFields = dynamicFieldsJsonText;
                            $rootScope.params_bankcardInfo2.verifyRef = smsResult.verifyRef;
                            $rootScope.params_bankcardInfo2.notWithholdSign = notWithholdSign;
                            $rootScope.params_bankcardVerify = $rootScope.params_bankcardInfo2;
                            $state.go("bankcardVerify");
                        } else if (response.rltCode == '14021') {
                            $state.go('accountErr');
                        } else {
                            Toast.show(response.rltMsg);
                        }
                    }).error(function (response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            }

            //打开协议窗口(弹出层)
            $scope.openAgreementWindow = function () {
                //没有银行协议,只打开快捷支付协议
                if (bankModel.bankServiceUrl == null || bankModel.bankServiceUrl == "") {
                    $scope.openProtocal('quick');
                } else {//快捷支付协议+银行协议
                    //弹出协议选择页面
                    $('body').append("<div class='mask-layer'></div>");
                    $scope.showProtocal = true;
                }
            };
            //关闭层
            $scope.cancel = function () {
                $('.mask-layer').remove();
                $scope.showProtocal = false;
            };

            //《快捷支付服务协议》《顺手付代扣协议》
            $scope.openProtocal = function (type) {
                //缓存参数
                sessionStorage.bankCardInfo2_params = JSON.stringify({
                    'stateParams': $rootScope.params_bankcardInfo2,
                    'phoneNumber': $scope.obj.phoneNumber,
                    'notWithholdSign': notWithholdSign
                });

                if (type == 'quick') {
                    $state.go('quickPayProtocal');//快捷支付服务协议
                } else if (type == 'withhold') {
                    $state.go('withholdProtocal');//顺手付委托扣款授权书
                } else if (type == 'bank') {//银行协议
                    $rootScope.bankServiceUrl = bankModel.bankServiceUrl;
                    $state.go('bankProtocal');
                }
                ;
                $('.mask-layer').remove();
            }
        }])
//去招商银行签约(hash:bankcardInfo3)
        .controller('BankCardInfoCtrl3', ['$scope', '$rootScope', '$state', '$timeout', 'NirvanaUtil', 'queryBindCardStatusService', 'addBankCardSuccessRoute', 'addBankCardFailRoute', 'Toast', 'frontWithholdService', 'withholdService', function ($scope, $rootScope, $state, $timeout, NirvanaUtil, queryBindCardStatusService, addBankCardSuccessRoute, addBankCardFailRoute, Toast, frontWithholdService, withholdService) {
            $scope.goBack = function () {
                window.history.back();
            };
            window.doKeyBack = function () {
                window.history.back();
            };
            //响应android物理返回键(顺手付)
            window.onBack = function(){
                window.doKeyBack();
            };

            var url = $rootScope.params_bankcardInfo3.url;
            var bankcardNumber = $rootScope.params_bankcardInfo3.bankCardNumber;
            var bankModel = $rootScope.params_bankcardInfo3.bankModel;

            $("#formBank").attr("action", url);
            $("#formBank").submit();

            //点击右边的完成
            $scope.finishGo = function () {
                //从支付列表进入添加银行卡，不需要开通代扣协议
                var notWithholdSign = $rootScope.params_bankcardInfo3.notWithholdSign;
                //查询快捷绑卡是否成功，不包含开通代扣服务状态查询
                $rootScope.loading = true;
                queryBindCardStatusService.query(bankcardNumber, bankModel.bankCode, bankModel.cardType).
                    success(function (response, status, headers, config) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                        if (response.rltCode == '00' && response.data) {
                            var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            result.payment = {
                                type: result.type,
                                signNo: result.signNo,
                                cardType: result.cardType,
                                bankCode: result.bankCode,
                                bankName: result.bankName,
                                cardNo: result.cardNo,
                                holderName: result.holderName,
                                bankSendSMS: result.bankSendSMS,
                                cardType: result.cardType,
                                sfBankCode: result.sfBankCode,
                                sfpBankAlias: result.sfpBankAlias,
                                dynamicFields: result.dynamicFields
                            };
                            result.notWithholdSign = notWithholdSign;
                            if (notWithholdSign == 'Y') {//不需要查询代扣服务开通状态
                                if ($rootScope.contractType == 'BALANCE') {//且开通余额代扣
                                    balanceWithholdSign(result.payment, result);
                                } else {
                                    addBankCardSuccessRoute.go(result);
                                }
                            } else {//开通代扣协议(前端签约只完成了开通快捷服务，快捷签约成功，则要进行开通代扣服务)
                                var params = {
                                    userMobile: $rootScope.userMobile,
                                    merchantId: $rootScope.merchantId,
                                    userId: $rootScope.userId,
                                    userName: $rootScope.userName,
                                    cardNo: bankcardNumber,
                                    cardType: bankModel.cardType,
                                    bankCode: bankModel.bankCode,
                                    bankName: bankModel.bankName,
                                    type: result.type,
                                    signNo: result.signNo
                                };
                                withholdSign(params, result);
                            }
                        } else if (response.rltCode == '14021') {
                            $state.go('accountErr');
                        } else {//去前端签约失败，从哪来到哪去
                            addBankCardFailRoute.go();
                        }
                    }).
                    error(function (response, status, headers, config) {
                        Toast.show(response.rltMsg);
                        $rootScope.loading = false;
                    });
            };
            //代扣签约
            function withholdSign(params, result) {
                $rootScope.loading = true;
                frontWithholdService.sign(params).
                    success(
                    function (response, status, headers, config) {
                        $rootScope.loading = false;
                        if (response.rltCode == '00' && response.data) {
                            //var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            Toast.show("开通委托代扣成功");
                            $timeout(function () {
                                addBankCardSuccessRoute.go(result);
                            }, 2000);
                        } else if (response.rltCode == '14021') {
                            $state.go('accountErr');
                        } else {//去前端签约成功，代扣失败，从哪来到哪去
                            Toast.show(response.rltMsg);
                            $timeout(function () {
                                addBankCardFailRoute.go();
                            }, 2000);
                        }
                    }).
                    error(function (response, status, headers, config) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            }

            //开通余额代扣
            function balanceWithholdSign(params, result) {
                withholdService.sign(params).
                    success(
                    function (response, status, headers, config) {
                        $rootScope.loading = false;
                        if (response.rltCode == '00' && response.data) {
                            //var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            Toast.show("开通余额委托代扣成功！");
                            $timeout(function () {
                                addBankCardSuccessRoute.go(result);
                            }, 2000);//为了显示成功提示信息
                        } else {
                            Toast.show(response.rltMsg);
                        }
                    }).
                    error(function (response, status, headers, config) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            }
        }])
        /*验证手机号验证码 hash:bankcardVerify*/
        .controller('BankCardValidPhoneCtrl', ['$scope', '$state', '$rootScope', '$timeout', 'NirvanaUtil', 'sendSignSmsService', 'bankCardSignService', 'bankCardWithholdSignService', 'addBankCardSuccessRoute', 'withholdService', 'Toast', function ($scope, $state, $rootScope, $timeout, NirvanaUtil, sendSignSmsService, bankCardSignService, bankCardWithholdSignService, addBankCardSuccessRoute, withholdService, Toast) {
            $scope.goBack = function () {
                window.history.back();
            };
            window.doKeyBack = function () {
                window.history.back();
            };
            //响应android物理返回键(顺手付)
            window.onBack = function(){
                window.doKeyBack();
            };

            $scope.obj = {
                validCode: ''
            };
            //自动倒计时
            $scope.autoSend = true;

            var smsVerifyRef = $rootScope.params_bankcardVerify.verifyRef;

            //重发短信接口
            $scope.send = function () {
                $rootScope.loading = true;
                sendSignSmsService.send($rootScope.params_bankcardVerify, $rootScope.params_bankcardVerify.dynamicFields, $rootScope.params_bankcardVerify.phoneNumber).
                    success(function (response) {
                        Toast.show(response.rltMsg);
                        if (response.rltCode == 00) {
                            $scope.validateField = false;
                            var smsResult = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            smsVerifyRef = smsResult.verifyRef;
                            $scope.autoSend = true;
                        } else if (response.rltCode == '14021') {
                            $state.go('accountErr');
                        }
                        $rootScope.loading = false;
                    }).error(function (response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            }

            //调用绑卡接口
            $scope.next = function () {
                //从支付列表进入添加银行卡，不需要开通代扣协议
                var notWithholdSign = $rootScope.params_bankcardVerify.notWithholdSign;
                if (notWithholdSign == 'Y') {
                    $rootScope.loading = true;
                    bankCardSignService.sign($rootScope.params_bankcardVerify, $rootScope.params_bankcardVerify.dynamicFields, $rootScope.params_bankcardVerify.phoneNumber, $scope.obj.validCode, smsVerifyRef).
                        success(function (response, status, headers, config) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00' && response.data) {
                                var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                result.notWithholdSign = notWithholdSign;
                                Toast.show("添卡成功！");
                                if ($rootScope.contractType == 'BALANCE') {//且开通余额代扣
                                    balanceWithholdSign(result.payment, result);
                                } else {
                                    $timeout(function () {
                                        addBankCardSuccessRoute.go(result);
                                    }, 2000);//为了显示成功提示信息
                                }
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            } else {
                                Toast.show(response.rltMsg);
                            }
                        }).error(function (response, status, headers, config) {
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                } else {
                    $rootScope.loading = true;
                    bankCardWithholdSignService.sign($rootScope.params_bankcardVerify, $rootScope.params_bankcardVerify.dynamicFields, $rootScope.params_bankcardVerify.phoneNumber, $scope.obj.validCode, smsVerifyRef).
                        success(function (response) {
                            $rootScope.loading = false;
                            if (response.rltCode == '00' && response.data) {
                                var result = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                                result.notWithholdSign = notWithholdSign;
                                Toast.show("开通委托代扣成功！");
                                $timeout(function () {
                                    addBankCardSuccessRoute.go(result);
                                }, 2000);//为了显示成功提示信息
                            } else if (response.rltCode == '14021') {
                                $state.go('accountErr');
                            } else {
                                Toast.show(response.rltMsg);
                            }
                        }).error(function (response) {
                            Toast.show(response.rltMsg);
                            $rootScope.loading = false;
                        });
                }
            }
            //开通余额代扣
            function balanceWithholdSign(params, result) {
                withholdService.sign(params).
                    success(
                    function (response) {
                        $rootScope.loading = false;
                        if (response.rltCode == '00' && response.data) {
                            //var res = NirvanaUtil.decryptRespone(response.data, response.responseTime);
                            Toast.show("开通余额委托代扣成功！");
                            $timeout(function () {
                                addBankCardSuccessRoute.go(result);
                            }, 2000);//为了显示成功提示信息
                        } else {
                            Toast.show(response.rltMsg);
                        }
                    }).
                    error(function (response) {
                        $rootScope.loading = false;
                        Toast.show(response.rltMsg);
                    });
            }
        }]);
});