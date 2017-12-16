/**
 * Created by 837781 on 2016/8/4.
 */
define(function (require) {
    var app = require('../app');
    app
        .factory('parseService', ['Toast', function (Toast) {
            return {
                dynamicFields: function (dynamicFieldsObj, formName) {
                    var dynamicFieldsJsonText = '';
                    var dynamicFieldsData = $("#" + formName).serializeArray();
                    if (dynamicFieldsObj && dynamicFieldsData.length > 0) {
                        dynamicFieldsJsonText = '[';
                        for (var i = 0; i < dynamicFieldsData.length; i++) {
                            var obj = dynamicFieldsData[i];
                            //验证安全码
                            if (dynamicFieldsObj[i].fieldName == "cvv") {
                                if (!/^\d{3}$/.test(obj.value)) {
                                    Toast.show("信用卡安全码为3位数字，请重新输入！");
                                    return null;
                                }
                            }
                            //验证有效期
                            if (dynamicFieldsObj[i].fieldName == "expDate") {
                                var month = '';
                                var year = '';
                                if ((obj.value).indexOf("/") > 0) {
                                    var arr = (obj.value).split("/");
                                    if (/^\d{2}$/.test(arr[0]) && /^\d{2}$/.test(arr[1])) {
                                        month = arr[0];
                                        year = arr[1];
                                        var d = new Date();
                                        var nowYear = d.getFullYear();
                                        var nowMonth = d.getMonth() + 1;
                                        if (parseInt("20" + year) < nowYear) {
                                            Toast.show("有效期的年份不能少于今年");
                                            return null;
                                        }
                                        if (month == '00') {
                                            Toast.show("输入的月份不能为00");
                                            return null;
                                        }
                                        if (parseInt(month) > 12) {
                                            Toast.show("输入的月份不能大于12");
                                            return null;
                                        }
                                        if (parseInt("20" + year) == nowYear
                                            && parseInt(month) < nowMonth) {
                                            Toast.show("有效期要不小于20" + year + "年" + nowMonth + "月");
                                            return null;
                                        }
                                    } else {
                                        Toast.show("有效期的格式不正确，如06/15");
                                        return null;
                                    }
                                } else {
                                    if (/^\d{4}$/.test(obj.value)) {
                                        month = obj.value.substring(0, 2);
                                        year = obj.value.substring(2, 4);
                                        var d = new Date();
                                        var nowYear = d.getFullYear();
                                        var nowMonth = d.getMonth() + 1;
                                        if (parseInt("20" + year) < nowYear) {
                                            Toast.show("有效期的年份不能少于今年");
                                            return null;
                                        }
                                        if (month == '00') {
                                            Toast.show("输入的月份不能为00");
                                            return null;
                                        }
                                        if (parseInt(month) > 12) {
                                            Toast.show("输入的月份不能大于12");
                                            return null;
                                        }
                                        if (parseInt("20" + year) == nowYear
                                            && parseInt(month) < nowMonth) {
                                            Toast.show("有效期要不小于20" + year + "年" + nowMonth + "月");
                                            return null;
                                        }
                                    } else {
                                        Toast.show("请输入4位数字作为有效期，如0615");
                                        return null;
                                    }
                                }
                                obj.value = year + month;
                            }
                            if (obj.name == dynamicFieldsObj[i].fieldName) {
                                dynamicFieldsObj[i].value = obj.value;
                            }

                            dynamicFieldsJsonText += JSON.stringify(dynamicFieldsObj[i]) + ",";
                        }

                        dynamicFieldsJsonText = dynamicFieldsJsonText.substring(0, dynamicFieldsJsonText.length - 1);
                        dynamicFieldsJsonText = dynamicFieldsJsonText + "]";
                    }
                    return dynamicFieldsJsonText;
                }
            }
        }]);

});