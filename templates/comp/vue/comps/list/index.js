/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-05-19 05:49:04
 * @modify date 2017-05-19 05:49:04
 * @desc
 *  <m-list :isLoading=true :enable=false :more=1 ></m-list>
 *  isLoaing 用于限制网络请求，防止多次触发
 *  enable 在存在多个List时可以只允许一个响应滚动事件
 *  more 是否有更多。首次必须是1
 */

define([], function() {
    return {
        template: "<div class='page-list'><slot></slot></div>",
        name: "paged-list",
        props: {
            more: {
                type: Number,
                default: 1
            },
            isLoading: {
                type: Boolean,
                default: false
            },
            enable: {
                type: Boolean,
                default: true
            }
        },
        data: function() {
            return {
                page: 1,
                limit: 15,
                start: 0
            }
        },
        activated: function() {

        },
        deactivated: function() {

        },
        watch: {
            more: function(val){
                if(val == 0){ //没有更多则自动解绑
                    this.unbindscroll();
                }
            }
        },
        mounted: function() {
            // 注册滚动事件
            this.unbindscroll();
            $(window).on('scroll.scollload' + this._uid, $.proxy(function() {
                if (this.more === 0 || this.isLoading || !this.enable) return;

                //滑到最低的时候才能刷新
                if (window.scrollY + document.documentElement.clientHeight < document.documentElement.scrollHeight) return;
                this.$emit("loadmore");
            }, this));
        },
        beforeDestroy: function() {
            this.unbindscroll();
        },
        methods: {
            unbindscroll: function(){
                // 取消滚动事件
                $(window).off('scroll.scollload' + this._uid);
            }
        }
    }
});
