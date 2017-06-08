/**
 * @file  common/bind.view.js
 * @author  newset (luojieyy@gmail.com)
 * @copyright  2017 | Medlinker
 * @date  2017-04-25
 */

define([
    'BaseView',
    'Model',
    'Store',
    'CompPath/lib/vue.min',
    'CompPath/vue/plugin'
], function(BaseView, Model, Store, Vue, Plugin) {
    var compHookCls = 'vue-comp-hook';

    Vue.prototype.$model = Model;
    Vue.prototype.$store = Store;

    Vue.use(Plugin);

    var vueHooks = ['beforeCreate', 'created', 'mounting', 'mounted', 'beforeDestroy', 'destroyed', "activated", "deactivated"];
    var vueProps = ['template', 'data', 'components', 'methods', 'props', 'computed', 'filters', 'validations', 'directives'];

    var BindView = _.inherit(BaseView, {
        $view: null,
        // overrider render, create, refresh
        render: function() {
            return "<div class='" + compHookCls + "'></div>"; //this.template;
        },
        _show: function($super, noEvent) {
            $super(noEvent);
            this.$init();
        },
        /**
         * 用于挂载 vue实例
         * @param  {object} 当前baseview 实例
         * @return {void}
         */
        $init: function(target) {
            if (!target) {
                return
            }

            var ctx = this;
            ctx.el = target.$("." + compHookCls)[0];
            ctx.template = ctx.template || target.template;
            beforeCreate = ctx.beforeCreate;
            ctx.beforeCreate = function() {
                this.$ctx = target;
                beforeCreate && beforeCreate.call(this);
            }
            target.$view = new Vue(ctx);
        },
        addEvent: function($super) {
            $super();

            this.on("onHide", function() {
                this.$view.$destroy();
            });
        }
    });

    return {
        /**
         * 主要接收 自定义的方法和属性
         * 通过覆盖 $init参数分别传递 vue 和 baseview各自的属性和方
         * @param  {object} vue 和 baseview 相关的方法和属性 
         * @return {object}
         */
        $extend: function(opts) {
            var init = BindView.prototype.$init,
                _vue = vueHooks.concat(vueProps);

            var view = _.inherit(BindView, _.omit(opts, _vue));
            view.prototype.$init = function() {
                init.call(_.pick(opts, _vue), this);
            }
            return view;
        },
        class: BindView
    }
});