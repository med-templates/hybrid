define([
    'AbstractView',
    'Model',
    'Store',
    'UITabbar',
    'cUser'
], function(AbstractView, Model, Store, UITabbar, cUser) {

    return _.inherit(AbstractView, {

        propertys: function($super) {
            $super();
            this.imgLazyLoad = true;
            //该页面是否需要登录鉴权
            this.needLogin = false;
            //登录后会返回用户数据
            this.USERINFO = {};
            this.userInfoM = Model.UserInfo.getInstance();

            this.project = 'hybrid';

            //解决Android中title设置不生效问题
            this.setWeixinHeader = true;

            this.needHeaderRefresh = false;

            this.logPageName = '';

            // 是否是在医联app内
            this.isMedlinkerApp = _.med.env.menlinker;
            // this.isMedlinkerApp = 1;

            this.deviceNum = '';
        },

        // 给请求参数添加地理位置
        setParamLatLng: function(param) {
            if (!param) {
                param = {};
            }

            if (this.pos) {
                param.lat = this.pos.lat;
                param.lng = this.pos.lng;
            } else {
                param.lat = '';
                param.lng = '';
            }

            return param;
        },

        initHeader: function() {
            if (this.noHeader) {
                this.header.hide();
                return;
            }

            var scope = this;
            var opt = {
                title: this.headerTitle || '医联'
            };

            opt.right = [];

            //native处理逻辑
            if (this.headerShare) {
                opt.right.push({
                    tagname: 'share',
                    value: '分享'
                })
            }

            this.header.set(opt);
            this.header.show();

        },

        //当用户重新登录,或者退出登录时,摧毁用户信息
        destoryUserInfo: function() {

        },

        setTitle: function(titleName) {
            //document.title=titleName;
            //// hack在微信等webview中无法修改document.title的情况
            //var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function() {
            //    setTimeout(function() {
            //        $iframe.off('load').remove()
            //    }, 0)
            //}).appendTo($('body'));
        },
        _show: function(noEvent) {
            if (noEvent) {
                this.status = 'show';
                this.$el.show();
                return;
            }

            this.trigger('onPreShow');

            window.scrollTo(0, 0);
            this.$el.show();
            this.status = 'show';

            this.bindEvents();

            // this.initHeader();
            this.trigger('onShow');
        },
        show: function(noEvent) {
            var scope = this;
            this.initHeader();

            //如果需要登录得先走登录逻辑校验
            if (this.needLogin) {
                this.showLoading();
                this.userInfoM.execute(function(data) {
                    scope.USERINFO = data;
                    scope._show(noEvent);
                });

            } else {
                this._show(noEvent);
            }
            //做图片延迟加载
            this.viewImgLazyLoad();

            //native下拉刷新逻辑
            this.addNativeRefreshEvent();

            // 图片加载失败
            this.$('img').error(function() {
                var realSrc = $(this).attr('data-real-src', $(this).attr('src'));

                if ($(this).hasClass('avatar')) {
                    $(this).attr('src', "static/img/common/avatar.png");
                } else {
                    $(this).attr('src', "static/img/common/placeholder.png");
                }
            });

            if (_.isHybrid()) {
                //有些页面需要注册页面加载事件
                _.requestHybrid({
                    tagname: 'onwebviewshow',
                    callback: function() {
                        scope.onWebviewShow();
                    }
                });
            }

        },

        //注册native的
        onWebviewShow: function() {

        },

        addNativeRefreshEvent: function() {
            if (!_.isHybrid() || !this.needHeaderRefresh) return;
            var scope = this;

            _.requestHybrid({
                tagname: 'headerrefresh',
                param: {
                    title: '',
                    slideText: '下拉刷新...', // 下拉提示文字（第二行）
                    loosenText: '松手刷新...', // 松手提示文字（第二行）
                    refreshText: '刷新中...' // 刷新中提示文字（第二行）
                },
                callback: function(data) {

                    if (_.isFunction(scope.refresh)) {
                        scope.refresh();
                    } else {
                        location.reload();
                    }
                }
            });
        },

        hide: function($super, noEvent) {
            $super();
            cUser.closeLogin && cUser.closeLogin();
            APP.tabbar && APP.tabbar.hide();
        },

        viewImgLazyLoad: function() {
            if (!this.imgLazyLoad) return;

            var imgs = this.$('img');
            var img;
            var dataSrc;
            var src;
            var tmp = {};

            for (var i = 0, len = imgs.length; i < len; i++) {
                img = imgs.eq(i);
                dataSrc = img.attr('data-src');
                src = img.attr('src');
                if (!dataSrc || dataSrc == src) continue;
                this._loadImg(img, dataSrc);
            }

        },

        hasLogin: function(onHasLogin, onLoginSucess) {
            var scope = this;

            if (!_.isEmpty(this.USERINFO)) {
                if (_.isFunction(onHasLogin)) {
                    onHasLogin();
                }
            }

            this.showLoading();
            if (_.isFunction(onLoginSucess)) {
                this.userInfoM.onLoginSuccess = function() {
                    onLoginSucess();

                };
            } else if (_.isFunction(onHasLogin)) {
                this.userInfoM.onLoginSuccess = function() {
                    onHasLogin();
                };
            }

            this.userInfoM.execute(function(data) {
                scope.USERINFO = data;
                if (_.isFunction(onHasLogin)) {
                    onHasLogin();
                }
                scope.hideLoading();
            });
        },

        // 打点
        addLog: function(source, target) {
            if (this.isMedlinkerApp) {
                return;
            }
        },

        // 获取设备号
        getDeviceNum: function() {
            var scope = this;

            if (this.isMedlinkerApp) {
                return;
            }

            _.requestHybrid({
                tagname: 'getdevicenum',
                callback: function(deviceNum) {
                    scope.deviceNum = deviceNum;
                }
            });
        },
        openLink: function(url) {
            _.requestHybrid({
                tagname: 'openLink',
                param: {
                    url: url
                }
            });
        },

        _loadImg: function(img, dataSrc) {
            $(new Image()).on('load', function() {
                img.attr('src', dataSrc);
            }).attr('src', dataSrc);
        }
    });
});