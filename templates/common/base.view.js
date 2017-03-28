define([
    'AbstractView',
    'Model',
    'Store',
    'UITabbar',
    'cUser',
    'common/publich5',
    'common/log'
], function(AbstractView, Model, Store, UITabbar, cUser, publich5, log) {

    return _.inherit(AbstractView, {

        propertys: function($super) {
            $super();
            this.imgLazyLoad = true;
            //该页面是否需要登录鉴权
            this.needLogin = false;
            //登录后会返回用户数据
            this.USERINFO = {};
            this.userInfoM = Model.UserInfo.getInstance();

            this.project = 'd2d';

            //解决Android中title设置不生效问题
            this.setWeixinHeader = true;

            this.needHeaderRefresh = false;

            // 获取定位
            this.getCurPos();

            this.logPageName = '';

            // 是否是在医联app内
            this.isMedlinkerApp = _.med.env.menlinker;
            // this.isMedlinkerApp = 1;

            this.deviceNum = '';
        },

        getCurPos: function() {
            var scope = this;
            publich5.getCurrentGeolocationPosition(function(pos) {
                scope.pos = pos;
            }, function() {
                scope.pos = {
                    lat: '',
                    lng: ''
                };
            });
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
                title: this.headerTitle || '医联通'
            };

            opt.right = [];

            if (!this.headerNotBack) {
                opt.back = function() {
                    // 打点
                    if (scope.viewId == 'intro') {
                        scope.addLog('page:/use_explain>btn:/close', 'page:/my');
                    } else if (scope.viewId == 'agreement') {
                        scope.addLog('page:/service_terms>btn:/close', 'page:/my');
                    } else if (scope.viewId == 'interlocution') {
                        scope.addLog('page:/wenzhen>btn:/close', 'page:/my');
                    }

                    scope.back();
                };
            }

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
            //      //如果包含就不要乱搞了
            //      if (!$.contains(this.wrapper[0], this.$el[0])) {
            //        //如果需要清空容器的话便清空
            //        if (this.needEmptyWrapper) this.wrapper.html('');
            //        this.wrapper.append(this.$el);
            //      }

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
                    title: '预约名医，快速转诊',
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

        setTabbar: function(viewId) {
            var scope = this;
            var data = [{
                'name': '首页',
                'target': 'index',
                'icon': 'static/img/common/tabbar.png',
                onclick: function() {
                    scope.hasLogin(function() {
                        scope.forward('index', {}, null, 'h5');
                    });
                }
            }, {
                'name': '经济人',
                'target': 'broker',
                'icon': 'static/img/common/tabbar.png',
                onclick: function() {
                    //需要当前用户对应的经纪人id
                    _.requestHybrid({
                        tagname: 'forward',
                        animate: 'present',
                        param: {
                            topage: 'chatwithagent?targetId=m' + scope.USERINFO.broker.id + '&title=' + scope.USERINFO.broker.name //需要当前用户对应的经纪人id
                        }
                    });

                }
            }, {
                'name': '我的',
                'target': 'my',
                'icon': 'static/img/common/tabbar.png',
                onclick: function() {
                    scope.forward('my', {}, null, 'h5');
                }
            }];

            if (!viewId) viewId = this.viewId;

            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].target == viewId) {
                    data[i].active = true;
                    break;
                }
            };

            APP.tabbar.set(data);
            APP.tabbar.show();
            APP.setViewportSize();

            //设置高度
            this.$el.addClass('has-tabbar');
        },

        // 打点
        addLog: function(source, target) {
            if (this.isMedlinkerApp) {
                return;
            }
            log.add(source, target);
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

        // 支付订单
        payOrder: function(payUrl) {
            if (_.med.env.ylt && !_.med.env.medlinker) {
                payUrl += '&redirectpage=webh5';
                this.jump2(payUrl);
            } else {
                _.requestHybrid({
                    tagname: 'oldpay',
                    param: {
                        orderurl: payUrl
                    }
                });
            }
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