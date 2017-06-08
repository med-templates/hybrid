/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-06-01 07:32:00
 * @modify date 2017-06-03 12:55:35
 * @desc 对话框管理
 */

define(["text!./index.html", '../popup'], function(html, Popup) {
    return {
        template: html,
        mixins: [Popup],
        props: {
            visible: {
                type: Boolean
            }
        },
        watch: {
            visible: function(val) {
                if (val) {
                    this.open();
                } else {
                    this.close();
                }
            }
        },
        mounted: function() {
            if (this.visible) {
                this.open();
            }
        },
        methods: {
            hide: function() {
                this.$emit('update:visible', false);
            },
            submit: function() {

            }
        }
    }
});