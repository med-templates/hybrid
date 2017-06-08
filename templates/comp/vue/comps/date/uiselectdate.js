/**
 * @overviews 选择日期
 * @author Zhao Li
 * @date 2016.7.25
 */
define([
    'UIGroupSelect'
], function(UIGroupSelect) {
    return function(opts) {
        var callback = opts.callback,
            title = opts.title,
            changeCallback = opts.changeCallback;

        function isLeapYear(year) {
            var pYear = year;
            if (!isNaN(parseInt(pYear))) {
                if ((pYear % 4 == 0 && pYear % 100 != 0) || (pYear % 100 == 0 && pYear % 400 == 0)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false
            }
        }

        function pad(num) {
            return ("00" + num).substr(-2);
        }

        var year = [],
            month = [],
            day = [],
            day31 = [],
            day30 = [],
            day29 = [],
            day28 = [],
            nowMonth = [],
            nM = new Date().getMonth() + 1, //当前月
            nD = new Date().getDate(),
            nowDay = [];
        var y = new Date().getFullYear();
        for (var a = 100; a >= 0; a--) {
            year.push({
                id: y - a,
                name: (y - a) + '年'
            });
        }
        for (var b = 0; b < 12; b++) {
            month.push({
                id: pad(b + 1),
                name: (b + 1) + '月'
            });
        }
        for (var c = 0; c < 31; c++) {
            day31.push({
                id: pad(c + 1),
                name: (c + 1) + '日'
            });
            day30.push({
                id: pad(c + 1),
                name: (c + 1) + '日'
            });
            day29.push({
                id: pad(c + 1),
                name: (c + 1) + '日'
            });
            day28.push({
                id: pad(c + 1),
                name: (c + 1) + '日'
            });
        }
        for (var d = 0; d < nM; d++) {
            nowMonth.push({
                id: pad(d + 1),
                name: (d + 1) + '月'
            });
        }
        for (var e = 1; e <= nD; e++) {
            nowDay.push({
                id: pad(e),
                name: (e) + '日'
            });
        }
        day30.pop();
        day29.pop();
        day29.pop();
        day28.pop();
        day28.pop();
        day28.pop();
        day = day31;
        return new UIGroupSelect({
            title: title,
            isDownIn: true,
            data: [
                year, nowMonth, nowDay
            ],
            indexArr: [year.length - 1, nowMonth.length - 1, nowDay.length - 1],
            onShow: function() {
                this.$el.addClass('cm-scroll-select-wrap');
                this.$('.cm-scroll-select-wrap').width('33%');
            },
            changedArr: [
                function(item) {
                    var yearT = item.id;
                    if (yearT == y) {
                        this.scrollArr[1].reload({ data: nowMonth }, this, 1);
                    } else {
                        this.scrollArr[1].reload({ data: month }, this, 1);
                    }
                },
                function(item) {
                    var yearT = this.scrollArr[0].getSelected().id,
                        arr = [1, 3, 5, 7, 8, 10, 12];
                    if (item.id == nM && yearT == y) {
                        this.scrollArr[2].reload({ data: nowDay }, this, 2);
                        return;
                    }
                    //二月特殊判断
                    if (item.id == 2) {
                        day = day28;
                        if (isLeapYear(yearT)) {
                            day = day29;
                        }
                        this.scrollArr[2].reload({ data: day }, this, 2);
                        return;
                    }
                    if (_.indexOf(arr, item.id) == -1) {
                        day = day30;
                    } else {
                        day = day31;
                    }
                    this.scrollArr[2].reload({ data: day }, this, 2);
                }
            ],
            onOkAction: function(time) {
                callback.call(this, time);
                this.hide();
            }
        });
    };

});