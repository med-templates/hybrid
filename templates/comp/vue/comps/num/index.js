/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-05-31 01:31:33
 * @modify date 2017-05-31 01:31:33
 * @desc [description]
 */
define(["text!./index.html"], function(html) {
    return {
        template: html,
        props: ["value", "allowZero"],
        methods: {
            add: function() {
                if (this.value >= 99) {
                    return
                }

                this.value++;
                this.$emit("input", this.value);
            },
            subtract: function() {
                if (this.value <= 1 && this.allowZero != 1) {
                    return
                }

                this.value--;
                this.$emit("input", this.value);
            }
        }
    }
});