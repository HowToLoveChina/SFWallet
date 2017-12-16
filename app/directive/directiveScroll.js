/**
 * Created by 837781 on 2016/8/4.
 */
define(['require', 'app'], function (require, app) {
    app.directive('scrollComponent', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {

                list: '=',//列表参数
                show: '=',//显示与否
                result: '=',//选择结果
                index: '='//默认选项
            },
            template: '<article ng-show="show" class="pop">' +
                            '<div class="list-pop ">' +
                                '<div class="list-header ">' +
                                    '<div ng-click="dismss()" class=" flex1">取消</div>' +
                                    '<div class="tips flex1 tr" ng-click="ok()">确定</div>' +
                                '</div>' +
                            '<div class="sle-item">&nbsp;</div>' +
                            '<div class="list-body tc full-h" >' +
                            '<div class="full-h full-w oa rel scroll" >' +
                            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
                            '<div class="item-sc" ng-class="item.text==result.text?activeClass:activeClassNone"' +
                            ' ng-click="onItemClick(item)" ng-repeat="item in list"  >{{item.text}}</div>' +
                            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
            '</article>',
            link: function ($scope, elm, attrs) {
                $scope.activeClass='active';
                $scope.activeClassNone='';
                var list = $(".scroll");
                var itemHeigth = 40;
                // list.on('touchend',getItem);
                function getItem() {
                    var top = list.scrollTop();
                    var mod = top / itemHeigth;
                    var int = Math.round(mod);

                    if (mod !== int) {
                        // list.animate({scrollTop:40*int});
                        list.scrollTop(itemHeigth * int);
                    }
                    if (int >= 0 && int < $scope.list.length) {
                        $scope.result = $scope.list[int] || null;
                        console.log($scope.result);
                        $scope.$apply();
                    }
                }

                var top = 0;
                var timer = null;
                list.scroll(function () {
                    if (timer == null) {
                        timer = setInterval(stop, 500)
                    }
                    function stop() {
                        if (list.scrollTop() == top) {
                            //console.log('stop');
                            getItem();
                            clearInterval(timer);
                            timer = null;
                        }
                    }

                    top = list.scrollTop();

                });
                $scope.$watch('show', function (newValue, oldValue) {
                    if (newValue == true && oldValue == undefined) {
                        // console.log('fuck')
                        init();
                    }
                    // console.log(newValue);
                    // console.log(oldValue);
                });
                function init() {
                    setTimeout(function () {
                        if ($scope.index) {
                            list.scrollTop(parseInt($scope.index) * itemHeigth + itemHeigth * 2);
                        } else {
                            list.scrollTop(itemHeigth * 2);
                        }
                    }, 200);
                }

                $scope.dismss = function () {
                    $scope.show = false;
                };
                // $scope._tmpSelected = ''//临时保存选择的结果
                $scope.ok = function () {

                    $scope.show = false;
                };
            }

        }
    });
});

