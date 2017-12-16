/**
 * Created by SF on 7/11/16.
 */

define(['require', 'app'], function (require, app) {
//简易页面滑动
    app
        .factory('pageSlide', [function(){
            return {
                simplePageSlide : function(target, stat, callback){
                    var target = $(target);
                    if(stat == 'center'){
                        $('body').addClass('translating');
                        target.removeClass('page-right').addClass('page-center');
                        if(callback)callback();
                    }else if(stat == 'right'){
                        target.removeClass('page-center').addClass('page-right');
                        setTimeout(function() {
                            $('body').removeClass('translating');
                            if(callback)callback();
                            //target.remove();
                        },300);
                    }else if(stat == 'up'){
                        $('body').addClass('translating');
                        target.removeClass('page-down').addClass('page-up');
                        if(callback)callback();
                    }else if(stat == 'down'){
                        target.removeClass('page-up').addClass('page-down');
                        setTimeout(function() {
                            $('body').removeClass('translating');
                            if(callback)callback();
                            //target.remove();
                        },1000);
                    }
                }
            };
        }]);

});