/**
 * @file  common/bind.view.js
 * @author  newset (luojieyy@gmail.com)
 * @copyright  2017 | Medlinker
 * @date  2017-04-25
 */

define([
    'AbstractView',
    'cUser'
], function(AbstractView, cUser) {
    return _.inherit(AbstractView, {
    	propertys: function($super) {
    		$super();

            this.project = 'hybrid';
    		//解决Android中title设置不生效问题
            this.setWeixinHeader = true;
    	},
    	initHeader: function() {
            if (this.noHeader) {
                this.header.hide();
                return;
            }
            var scope = this;
            var opt = { title: this.headerTitle || '医联' };

            opt.right = [];

            //native处理逻辑
            if (this.headerShare) {
                opt.right.push({ tagname: 'share', value: '分享' })
            }

            this.header.set(opt);
            this.header.show();
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