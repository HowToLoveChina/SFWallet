/**
 * Created by SF on 7/8/16.
 */
define(['require', 'app'], function (require, app) {
    app
    .factory('sfPayDate', [function() {
        return {
            compare : function(date1, date2) {
                if(date1 == null || date2 == null){
                    return -1;
                }
                date1 = date1.replace(/\-/gi,"/");
                date2 = date2.replace(/\-/gi,"/");
                var time1 = new Date(date1).getTime();
                var time2 = new Date(date2).getTime();
                if(time1 > time2){
                    return 1;
                }else if(time1 == time2){
                    return 2;
                }else{
                    return 3;
                }
            },
            getNowDate : function () {
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
    } ]);

});