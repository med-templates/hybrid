/**
 * @file  model/model.js
 * @copyright  2017 | Medlinker
 * @date  2017-03-28
 */

define([
    'AbstractModel', 'AbstractStore', 'cUser', 'Store'
], function(
    AbstractModel, AbstractStore, cUser, Store
) {

    var ERROR_CODE = {
        'NOT_LOGIN': '3',
        'NO_USER': '6000020',
        'NO_REG': '20005',
        'NOT_VERIFY': '10119',
        'DOCTOR_VERIFY_FAIL': '10120',
        'DOCTOR_VERIFY_WAIT': '10121'
    };

    //获取产品来源
    var getUs = function() {
        var us = 'webapp';

        //如果url具有us标志，则首先读取
        if (_.getUrlParam().us) {
            us = _.getUrlParam().us;
        }

        return us;
    };

    var SIGN_STR = 'bdbus&luzhandui2015~Y~';

    var BaseModel = _.inherit(AbstractModel, {

        initDomain: function() {
            var host = window.location.host;
            this.domain = host;
        },

        propertys: function($super) {
            $super();

            this.initDomain();

            var t = (new Date().getTime()).toString();
            this.path = '';

            this.ajaxOnly = false;
            this.cacheData = null;
            this.param = {};
            this.urlParam = {};
            this.dataType = 'json';

            this.shouldClear = false;

            this.autoHide = true;

            this.errorCallback = function() {

            };

            //特殊错误码处理程序
            this.errCodeCallback = {};

            //统一处理分返回验证
            this.pushValidates(function(data) {
                return this.baseDataValidate(data);
            });

        },

        openLogin: function() {
            var scope = this;
            var param = {
                med_channel: 'hospital',
                med_project: 'hospital',
                onsuccess: function() {
                    if (!APP.curView.loginNotReload) {
                        window.location.reload();
                    }
                },
                onfail: function() {
                    APP.curView.back();
                }
            }

            cUser.openLogin(param);
        },

        //首轮处理返回数据，检查错误码做统一验证处理
        baseDataValidate: function(data) {
            if (this.autoHide) window.APP.hideLoading();
            var scope = this;

            //记录请求返回
            if (!data) {
                window.APP.showToast('服务器出错，请稍候再试');
                return;
            }

            if (_.isString(data)) data = JSON.parse(data);
            if (data.errcode === 0) return true;

            // 浩哥提供的接口的errcode和彪哥的有冲突，这里解决下
            if (/^http:\/\/app/.test(this.url) || /^http:\/\/im-api/.test(this.url)) {
                ERROR_CODE['NOT_LOGIN'] = 20004;
            }

            //自定义处理最优先
            if (this.errCodeCallback[data.errcode]) {
                this.errCodeCallback[data.errcode](data.errcode, data.errmsg, data);
                return false;
            }

            //处理统一登录逻辑
            //app和医联通接口，未登陆的状态码是2个
            if (data.errcode == ERROR_CODE['NOT_LOGIN'] || data.errcode == ERROR_CODE['NO_REG']) {
                scope.openLogin();
                return false;
            }

            //用户不存在情况
            if (data.errcode == ERROR_CODE['NO_USER']) {
                APP.forward('login');
                return false;
            }

            if (window.APP && data && data.errmsg) window.APP.showToast(data.errmsg, this.errorCallback);

            return false;
        },

        dataformat: function(data) {
            if (_.isString(data)) data = JSON.parse(data);
            return data.data;
        },

        buildurl: function() {
            var url = this.url;
            var scope = this;
            var reg = /\{([\s\S]+?)\}|$/g;
            var _url = '';
            var index = 0;

            url.replace(reg, function(key, name, offset) {

                _url += url.slice(index, offset)
                if (name) {
                    _url += scope.urlParam[name];
                }
                index = offset + key.length;
                return key;
            });

            //return this.protocol + '://' + this.domain + this.path + _url;
            return _url;
        },

        getSign: function() {
            var param = _.extend({}, this.getParam() || {});
            if (param.head) delete param.head;
            return JSON.stringify(param);
        },

        onDataSuccess: function(fdata, data) {
            //暂时只存储get请求数据
            if (this.cacheData && this.cacheData.set && this.type.toLowerCase() == 'get') {
                var key = this.cacheData.key;
                var tmp;
                var listKey = this.cacheData.listKey;

                if (listKey) {
                    tmp = this.urlParam[listKey]
                    if (tmp === undefined)
                        tmp = this.param[listKey]
                    if (tmp !== undefined)
                        key = key + '_' + tmp;
                }

                this.cacheData.key = key;
                this.cacheData.set(fdata, this.getSign());
            }
        },


        //重写父类getParam方法，加入方法签名
        getParam: function() {
            var param = _.clone(this.param || {});

            if (param.head) delete param.head;

            this.param = param;

            // 加入默认参数
            if (this.defaultParam) {
                _.extend(this.param, this.defaultParam);
            }

            return this.param;
        },

        //当执行登录,登出,编辑用户资料等数据请求时,需要清理一些用户相关或者敏感数据
        //@override
        clearBusinessData: function() {
            //如果非业务数据,则不需要关注
            if (!(this.shouldClear && this.type.toLowerCase() == 'post')) return;

            AbstractStore.clearData();

            var s = '';
        },

        execute: function($super, onComplete, onError, ajaxOnly, scope) {

            if (this.fakeData) {
                if (this.autoHide) window.APP.hideLoading();
                onComplete(this.fakeData());
                return;
            }

            this.clearBusinessData();

            var data = null;
            if (!ajaxOnly && !this.ajaxOnly && this.cacheData && this.cacheData.get) {

                var key = this.cacheData.key;
                var listKey = this.cacheData.listKey;

                //暂时只存储get请求数据
                if (listKey) {
                    tmp = this.urlParam[listKey]
                    if (tmp === undefined)
                        tmp = this.param[listKey]
                    if (tmp !== undefined)
                        key = key + '_' + tmp;
                }

                this.cacheData.key = key;

                data = this.cacheData.get(this.getSign());
                if (data) {
                    if (this.autoHide) window.APP.hideLoading();
                    onComplete(data);
                    return;
                }
            }

            $super(onComplete, onError, ajaxOnly, scope);
        }

    });

    var apiorgin = (function() {
        var host = location.host;
        if (/dev/.test(host)) {
            return ['http://d2d.dev.pdt5.medlinker.net', 'http://d2d.dev.pdt5.medlinker.net', 'http://app.dev.pdt5.medlinker.net', 'http://passport.dev.pdt5.medlinker.net', 'http://im-api.qa.medlinker.com'];
        } else if (/qa/.test(host)) {
            return ['https://qa-d2d.medlinker.com', 'http://d2d.qa.medlinker.com', 'http://app.qa.medlinker.com', 'http://passport.qa.medlinker.com', 'http://im-api.qa.medlinker.com'];
        } else {
            return ['https://ylt.medlinker.com', 'https://ylt.medlinker.com', 'http://app.medlinker.com', 'https://passport.medlinker.com', 'https://im-api.medlinker.com/'];
        }
    })();

    var _t = !_.isHybrid() ? 'web' : $.os.ios ? 'i' : 'a';

    // 公共参数
    var _param = {
        'sys_v': _t,
        'sys_p': _t,
        'cli_v': '5.0.0',
        'sys_m': _t,
        'cli_c': _t
    };
    var devInfoStore = Store.DevInfo.getInstance();
    var devInfo = devInfoStore.get();

    if (devInfo) {
        _.extend(_param, devInfo);
    } else {
        _.requestHybrid({
            tagname: 'getdeviceinfo',
            callback: function(data) {
                if (data) {
                    _.extend(_param, data);
                    devInfoStore.set(data);
                }
            }
        });
    }

    /**
     * syntax sugar for model delcaration
     * @param  {Object}     opts Model 参数
     *       - url          model地址
     *       - domain       model使用的域名
     *       - fallthrough  出现错误时是否传递错误信息给原始调用
     *       - shouldclear  是否清除用户数据
     *       - cahce        缓存名称: Store 定义的实例
     *       - app          添加app相关默认信息
     *       - validation   数据验证，对错误码进行验证处理
     * @return {Function}   接受表单参数 和 urlParam 的函数方法, 并返回实例对象
     */
    function makeModel(opts) {
        var url = opts.url,
            domain = opts.domain != undefined ? opts.domain : 1;

        var model = _.inherit(BaseModel, {
            propertys: function($super) {
                $super();
                this.url = apiorgin[domain] + url;
                this.fallthrough = opts.fallthrough || false;
                this.shouldClear = opts.shouldClear || false;
                // 兼容 app 接口
                this.defaultParam = opts.app ? _param : {};

                if (opts.cache) {
                    this.cacheData = Store[opts.cache] && Store[opts.cache].getInstance();
                }

                opts.validation && this.pushValidates(opts.validation);
            }
        })
        var instance = model.getInstance();

        return function(data, param, clear) {
            if (clear && instance.cacheData) {
                instance.cacheData.clearData();
            }

            if (param) {
                instance.urlParam = param;
            }

            if (data) {
                instance.setParam(data);
            }
            return instance;
        }
    }

    return {
        /**
         * userInfo
         */
        UserInfo: makeModel({ url: '/profile' })
    };
});