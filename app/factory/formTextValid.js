/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
    app
        .factory('formTextValid', ['Toast', function(Toast) {
            return {
                check : function(form) {
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

});