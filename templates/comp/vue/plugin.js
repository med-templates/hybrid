/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-05-19 05:23:10
 * @modify date 2017-05-19 05:23:10
 * @desc [description]
 */
define([
    "CommonPath/validate",
    "./comps/list/index"
], function(
    validator,
    List
) {
    var noop = function() {},
        expressionCache = (function() {
            var cahce = {};
            return {
                get: function(exp) {
                    return cahce['$exp_' + exp];
                },
                put: function(exp, val) {
                    cahce["$exp_" + exp] = val;
                }
            };
        })();

    function parseExpression(exp) {
        // 去掉前后空字符
        exp = exp.trim()
        if (exp.indexOf("[") == 0) {
            throw "express start with [ not supported yet";
        }

        var hit = expressionCache.get(exp)
        if (hit) {
            return hit
        }
        // 存放解析之后的结果
        var res = { exp: exp }
            // 每个exp表达式的解析结果中必须有get方法
        res.get = makeGetterFn('scope.' + exp)
        expressionCache.put(exp, res)
        return res
    }

    function makeGetterFn(body) {
        try {
            // scope是函数的参数；body是方法体。将此方法赋值给表达式的get方法，就可以方便的拿到表达式的值
            return new Function('scope', 'return ' + body + ';')
        } catch (e) {
            return noop
        }
    }


    return {
        install: function(Vue) {
            // 全局组件
            Vue.component('m-list', List);

            /**
             * 添加简单的 keypath 获取 实例值方法
             * @param  {string} key vue实例中data 属性的 keypath - 'a.b.c', 暂不支持以 [] 开头的表达式
             * @return {string|object}
             */
            Vue.prototype.$get = function(key) {
                // 解析表达式，并返回一个包含get方法的对象。
                var res = parseExpression(key)
                if (res) {
                    // 这里不能保证在执行get时不报错，因此需要放入try/catch中
                    try {
                        // get方法接收一个参数作为它的参数
                        return res.get.call(this, this)
                    } catch (e) {}
                }
            };

            /**
             * 全局混合
             */
            Vue.mixin({
                created: function() {
                    if (!this.$ctx && this.$root.$ctx) {
                        this.$ctx = this.$root.$ctx;
                    }
                },
                methods: {
                    /**
                     * 页面跳转
                     */
                    $forward: function(page, opts) {
                        this.$ctx.forward(page, opts)
                    },

                    /**
                     * 根据 validation 属性做数据验证
                     * @param  {string} field 可选参数，传入时只对单个字段进行校验
                     * @return {string}       true | 验证信息
                     */
                    $validate: function(field, toast) {
                        var valid = true;
                        if (!this.$options.validations) {
                            throw 'valdations options must be set including rules and messages';
                        }
                        // 全部字段校验
                        var rules = this.$options.validations.rules,
                            msgs = this.$options.validations.messages;

                        // 单个字段校验
                        if (field) {
                            valid = validator.field(this.$get(field), this.$options.validations.rules[field]);

                            if (valid != true) {
                                toast && this.$ctx.showToast && this.$ctx.showToast(msgs[field]);
                                return msgs[field];
                            }
                            return true;
                        }

                        for (var item in rules) {
                            var val = this.$get(item);
                            if (!validator.field(val, rules[item])) {
                                if (toast) {
                                    this.$ctx.showToast && this.$ctx.showToast(msgs[item]);
                                }
                                return msgs[item];
                            };
                        }

                        return true;
                    },

                    /**
                     * 设置页面header
                     */
                    $header: function(opts) {
                        this.$ctx.header.set(opts);
                    }
                }
            });

            /**
             * 全局filter
             */

            /**
             * 性别文案
             * @param {Number} *sex
             */
            Vue.filter('sex-name',function(sex){
                return sex == 2? '女': '男'
            });
        }
    }
});
