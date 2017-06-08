/**
 * @author luojie
 * @email luojieyy@gmail.com
 * @create date 2017-05-17 04:09:19
 * @modify date 2017-05-27 11:46:08
 * @desc 选择日期组件
 */

define([
    './uiselectdate'
], function(SelectDate) {
    var selector = null;

    return {
        template: "<div class='select-date' @click='show'><slot></slot></div>",
        data: function() {
            return {
                times: null,
                date: null
            }
        },
        props: ["value", "title"],
        mounted: function() {
            selector = SelectDate({
                callback: function(times) {},
                title: "请选择日期" || this.title
            });
        },
        destroyed: function() {
            // selector.destroy();
            selector = null;
        },
        methods: {
            show: function() {
                var ctx = this;
                // 更新时间
                if (this.times) {
                    this.times.forEach(function(element, index) {
                        selector.scrollArr[index].setIndex(element);
                    }, this);
                }

                selector.onOkAction = function(times) {
                    var date = times.map(function(item) {
                        return item.id;
                    }).join("-");
                    ctx.$emit("input", date);
                    ctx.times = this.scrollArr.map(function(elm) {
                        return elm.index;
                    });

                    this.hide();
                }

                selector.show();
            }
        },
        watch: {
            value: function(val) {
                this.date = val;
            }
        }
    }
});