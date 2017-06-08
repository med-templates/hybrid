/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-05-26 11:52:08
 * @modify date 2017-05-26 12:28:10
 * @desc [description]
 */

define(["UIGroupSelect"], function(UIGroupSelect) {
    var picker = null;

    return {
        template: "<span class='vue-select' @click='show'>{{current || placeholder}}</span>",
        name: "m-select",
        data: function() {
            return {
                opts: []
            }
        },
        props: ["options", "value", "placeholder", "isDown", "current"],
        picker: null,
        created: function() {
            this.opts = this.options;
        },
        watch: {
            options: function(val) {
                this.opts = val;
                if (!this.current && this.value) {
                    val.map(function(item) {
                        if (item.id == this.value) {
                            this.current = item.name;
                        }
                    }.bind(this))
                }
            }
        },
        methods: {
            show: function() {
                if (!this.opts.length) {
                    return
                }

                var _vue = this;
                if (!picker) {
                    picker = new UIGroupSelect({
                        title: "请选择",
                        data: [this.opts],
                        isDownIn: this.isDown
                    });
                } else {
                    picker.data = [this.opts];
                    picker.scrollArr[0].reload();
                }

                picker.onOkAction = function(data) {
                    this.$emit("input", data[0].id);
                    this.current = data[0].name;
                    picker.hide();
                }.bind(this);

                picker.show();
            }
        }
    }
});