define(["$","require"],function ($,require) {
    var app = require('../app');
    app
        .factory('Toast', [function() {
            return {
                show : function(message) {
                    if (message && message != '') {
                        new Toast({context:$('body'),message:message}).show();
                    }
                }
            }
        } ]);

    /**
     * 模仿android里面的Toast效果，主要是用于在不打断程序正常执行的情况下显示提示数据
     * @param config
     * @return
     */
    var Toast = function(config){
        this.context = config.context==null?$('body'):config.context;//上下文
        this.message = config.message;//显示内容
        this.time = config.time==null?3000:config.time;//持续时间
        this.left = config.left;//距容器左边的距离
        this.top = config.top;//距容器上方的距离
        this.init();
    };
    var msgEntity;
    Toast.prototype = {
        //初始化显示的位置内容等
        init : function(){
            $("#toastMessage").remove();
            var w = window.screen.width;
            /*console.log(w);
             if(w == 320 || w >= 1080 || w == 1536){
             w = w * 0.04;
             }else if(w == 360 || w == 375){
             w = w * 0.12;
             }else if(w == 414){
             w = w * 0.16;
             }else{
             w = w * 0.1;
             }
             console.log(w);*/
            //设置消息体
            var msgDIV = new Array();
            msgDIV.push('<div id="toastMessage">');
            msgDIV.push('<span>'+this.message+'</span>');
            msgDIV.push('</div>');
            msgEntity = $(msgDIV.join('')).appendTo(this.context);
            //设置消息样式
            var marginLeft = (this.left == null)?(0 - (msgEntity.find('span').width() + w) / 2):this.left;
            var marginTop = (this.top ==null)?(0 - msgEntity.height()/2):this.top;
            var left = this.left == null ? this.context.width()/2-msgEntity.find('span').width()/2 : this.left;
            var top = this.top == null ? '20px' : this.top;
            msgEntity.css({position:'absolute',width:'80%','margin-left' : '10%',
                'z-index':'99',top:'250px','text-align':'center','border-radius':'4px','background-color':'black',color:'white','font-size':'18px',padding:'7px'});
            // msgEntity.hide();
        },
        //显示动画
        show :function(){
            msgEntity.fadeIn(this.time/2);
            msgEntity.fadeOut(this.time/2);
        }

    };
    // var msgDIV;
    // Toast.prototype = {
    //     //初始化显示的位置内容等
    //     init : function(){
    //         $("#toastMessage").remove();
    //         var w = window.screen.width;
    //         /*console.log(w);
    //          if(w == 320 || w >= 1080 || w == 1536){
    //          w = w * 0.04;
    //          }else if(w == 360 || w == 375){
    //          w = w * 0.12;
    //          }else if(w == 414){
    //          w = w * 0.16;
    //          }else{
    //          w = w * 0.1;
    //          }
    //          console.log(w);*/
    //         //设置消息体
    //         var msgDIV = document.createElement("div");
    //         msgDIV.innerHTML='<div id="toastMessage">'
    //                             +'<span>'+this.message+'</span>'
    //                         +'</div>';
    //
    //         if(this.context.nodeType){
    //             this.context.appendChild(msgDIV);
    //         }else {
    //             this.context[0].appendChild(msgDIV);
    //         }
    //
    //
    //         //设置消息样式
    //         var marginLeft = (this.left == null)?(0 - (msgDIV.firstChild.width + w) / 2):this.left;
    //         var marginTop = (this.top ==null)?(0 - msgDIV.height/2):this.top;
    //         var left = this.left == null ? this.context.width/2-msgDIV.firstChild.width/2 : this.left;
    //         var top = this.top == null ? '20px' : this.top;
    //         msgDIV.cssText="display:none;opacity:0;;position:'absolute';width:'80%';'margin-left' :" +
    //             " '10%';'z-index':'99';top:'250px';'text-align':'center';'border-radius':'4px';'background-color':'black';color:'white';" +
    //             "'font-size':'18px';padding:'7px';" +
    //             "transition: opacity ease-in 800ms;";
    //
    //         // msgEntity.hide();
    //     },
    //     //显示动画
    //     show :function(){
    //        msgDIV.style.opacity=1;
    //         var timer = setTimeout(function () {
    //             msgDIV.style.opacity=0;
    //
    //         },timer/2)
    //
    //     }
    //
    // }

});



