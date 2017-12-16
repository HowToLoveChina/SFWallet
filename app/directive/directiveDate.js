/**
 * Created by 837781 on 2016/8/4.
 */
define(['require', 'app'], function (require, app) {
    app.directive('scrollDateComponent', function () {
        return {
            restrict: 'AE',
            replace: true,
            template: '<article ng-show="showDateScroll" class="pop">' +
            '<div class="list-pop ">' +
            '<div class="list-header ">' +
            '<div ng-click="dismiss()" class="flex1">取消</div>' +
            '<div ng-click="sure()" class="flex1 tips tr">确定</div>' +
            '</div>' +
            '<div class="sle-item">&nbsp;</div>' +
            '<div class="list-body tc full-h" >' +
            '<div class="full-h flex1 oa rel list-d" id="list-y">' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '<div  class="item-sc" ng-class="item==year?activeClass:activeClassNone"  ng-repeat="item in years">{{item}}</div>' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '</div>' +

            '<div class="full-h flex1 oa rel list-d" id="list-m">' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '<div  class="item-sc" ng-class="item==month?activeClass:activeClassNone"  ng-repeat="item in months">{{item}}</div>' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '</div>' +

            '<div class="full-h flex1 oa rel list-d" id="list-d">' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '<div  class="item-sc" ng-class="item==day?activeClass:activeClassNone" ng-repeat="item in days">{{item}}</div>' +
            '<div class="item-sc">&nbsp;</div><div class="item-sc">&nbsp;</div>' +
            '</div>' +

            '</div>' +
            '</div>' +
            '</article>',
            controller: function ($scope) {
                $scope.activeClass='active';
                $scope.activeClassNone='';
                var d = new Date();
                //当前年份
                var year = parseInt(d.getFullYear());
                $scope.year = year;
                //当前月份
                $scope.month = parseInt(d.getMonth()) + 1;
                //当前天
                $scope.day = parseInt(d.getDate());

                var _years = [];
                for (var i = year - 20; i < year + 60; i++) {
                    _years.push(i);
                }
                $scope.years = _years;

                $scope.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

                function getDays(y, m) {
                    var _days = [];
                    // console.log('y:'+y+'m:'+m);
                    var _d = new Date(y, m, 0).getDate();
                    for (var j = 1; j <= _d; j++) {
                        _days.push(j);
                    }
                    return _days;
                }

                $scope.days = getDays($scope.year, $scope.month);
                console.log('$scope.days:' + $scope.days + ';$scope.day:' + $scope.day);
                // $scope.setYear = function (y) {
                //     year = parseInt(y);
                //     $scope.year = year;
                //     $scope.days = getDays(year, month);
                // };
                // $scope.setMonth = function (m) {
                //     month = parseInt(m);
                //     $scope.days = getDays(year, m);
                //     $scope.month = month;
                // };
                // $scope.setDay = function (d) {
                //     day = parseInt(d);
                //     $scope.day = day;
                // };
                $scope.sure = function () {
                    $scope.dismiss();
                    var res = $scope.year + "-" + ($scope.month < 10 ? '0' + $scope.month : '' + $scope.month) + "-" + ($scope.day < 10 ? '0' + $scope.day : '' + $scope.day);
                    if ($scope.showDateScrollType == 'start') {
                        $scope.obj.startDate = res;
                    } else if ($scope.showDateScrollType == 'end') {
                        $scope.obj.endDate = res;
                    }
                };
                //关闭日期控件
                $scope.dismiss = function () {
                    $scope.showDateScroll = false;
                };

                var list = $(".list-d");
                var listY = $("#list-y");
                var listM = $("#list-m");
                var listD = $("#list-d");
                var itemHeigth = 40;

                var topY = 0;
                var topM = 0;
                var topD = 0;
                var timerY = null;
                var timerM = null;
                var timerD = null;
                listY.scroll(function () {
                    if (timerY == null) {
                        timerY = setInterval(stop, 500)
                    }
                    function stop() {
                        if (listY.scrollTop() == topY) {
                            console.log('stop');
                            var mod = topY / itemHeigth;
                            var int = Math.round(mod);

                            if (mod !== int) {
                                // list.animate({scrollTop:40*int});
                                listY.scrollTop(itemHeigth * int);
                            }
                            $scope.year = $scope.years[int];
                            $scope.days = getDays($scope.year, $scope.month);
                            $scope.$apply();
                            console.log('$scope.year:' + $scope.year);
                            clearInterval(timerY);
                            timerY = null;
                        }
                    }

                    topY = listY.scrollTop();

                });
                listM.scroll(function () {
                    if (timerM == null) {
                        timerM = setInterval(stop, 500)
                    }
                    function stop() {
                        if (listM.scrollTop() == topM) {
                            console.log('stop');
                            var mod = topM / itemHeigth;
                            var int = Math.round(mod);

                            if (mod !== int) {
                                // list.animate({scrollTop:40*int});
                                listM.scrollTop(itemHeigth * int);
                            }

                            $scope.month = $scope.months[int];
                            $scope.days = getDays($scope.year, $scope.month);
                            $scope.$apply();
                            console.log('$scope.month:' + $scope.month);
                            clearInterval(timerM);
                            timerM = null;
                        }
                    }

                    topM = listM.scrollTop();

                });
                listD.scroll(function () {
                    if (timerD == null) {
                        timerD = setInterval(stop, 500)
                    }
                    function stop() {
                        if (listD.scrollTop() == topD) {
                            console.log('stop');
                            var mod = topD / itemHeigth;
                            var int = Math.round(mod);

                            if (mod !== int) {
                                // list.animate({scrollTop:40*int});
                                listD.scrollTop(itemHeigth * int);
                            }
                            $scope.day = $scope.days[int];
                            $scope.$apply();
                            console.log('$scope.day:' + $scope.day);
                            clearInterval(timerD);
                            timerD = null;
                        }
                    }

                    topD = listD.scrollTop();

                });
                $scope.$watch('showDateScroll', function (newValue, oldValue) {
                    if (newValue == true && oldValue == undefined) {
                        init();
                    }
                });
                function init() {
                    setTimeout(function () {

                        listY.scrollTop(($scope.years.indexOf($scope.year)-2) * itemHeigth + itemHeigth * 2);
                        listM.scrollTop(($scope.month-3) * itemHeigth + itemHeigth * 2);
                        listD.scrollTop(($scope.day-2) * itemHeigth + itemHeigth * 2);

                    }, 200);
                }
            }

        }
    });

});
