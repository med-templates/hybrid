/**
 * @file  common/list.view.js
 * @author  newset (luojieyy@gmail.com)
 * @copyright  2017 | Medlinker
 * @date  2017-03-03
 * 
 * 滚动分页,必须属性
 * this.listModel
 * this.$listWrapper = this.$('.js-list-wrapper');
 * this.$noneData = this.$('.js-none-data');
 * this.$loadEnd = this.$('.js-loading-end');
 * this.listTpl = '';
 * 
 */
define([
    'BaseView',
    'common/publich5'
], function(BaseView, publich5) {

    return _.inherit(BaseView, {
        propertys: function($super) {
            $super();

            this.pageData = {
                start: 0,
                more: 1, //默认不是0就行
                pageSize: 15,
                isLoading: false
            };

            this.isDefaultLoading = true; //是否默认载入
            this.noHeader = true;

            this.first = true;

            //列表模板
            this.listTpl = '';
            this.events = {
                'click .js-tosearch-wrapper': 'toSearchAction', //所有search框跳转
                'click .js-to-doctordetail': 'toDoctorDetailAction' //所有医生块跳转至医生详情页面
            };
        },

        initElement: function($super) {
            $super();
            this.$listWrapper = this.$('.js-list-wrapper');
            this.$noneData = this.$('.js-none-data');
            this.$loadEnd = this.$('.js-loading-end');
            this.$firstEmpty = this.$('.js-first-empty');
            this.$preView = this.$('.js-pre-view');
        },

        //因为一些原因要重新加载数据,这个时候一些参数要重新设置
        resetPageInfo: function(start, pageSize) {
            this.pageData = {
                start: start || 0,
                more: 1, //默认不是0就行
                pageSize: pageSize || 15,
                isLoading: false
            };
            this.first = true;
            this.$noneData.hide();
            this.$loadEnd.hide();
            this.$firstEmpty.hide();
            this.$listWrapper.show().html('');

        },

        reloadList: function(start, pageSize, cb) {
            this.resetPageInfo(start, pageSize);
            this.initList(cb);
            if (!this.index) {
                this.bindScrollEvent();
            }
        },

        //@override
        //返回列表请求时需要的参数
        getListParam: function() {
            var param = {};
            return param;
        },

        //@override
        //每次请求结束,想做的事情,如果返回true则不会执行原有加载逻辑
        onRequestSucces: function(data) {},

        //@override
        //处理server端返回数据,构造渲染list结构时候的数据对象,这里做适配以免变化
        getTplData: function(data) {
            //现在统一将数组对象放入list字段中
            return data;
        },

        initList: function(cb) {
            var scope = this;
            var param = this.getListParam();

            //首先设置分页参数
            param.start = this.pageData.start;
            param.limit = this.pageData.pageSize;

            if (this.needPostion) {
                param = this.setParamLatLng(param);
            }

            this.getDoctorData(param, cb);
        },

        getDoctorData: function(param, cb) {
            var scope = this;

            this.listModel.setParam(param);
            this.showLoading();
            this.pageData.isLoading = true;
            this.listModel.get(function(data) {

                scope.$preView && scope.$preView.hide();

                scope.pageData.isLoading = false;
                if (scope.onRequestSucces(data)) {
                    return;
                }

                data = scope.getTplData(data);
                scope.pageData.start = data.start;
                scope.pageData.more = data.more;

                //没有数据的场景
                if (data.list.length == 0 && scope.pageData.start === 0) {
                    if (scope.first) {
                        scope.$firstEmpty.show();
                    } else {
                        scope.$noneData.show();
                    }
                    //                    scope.first = false;


                    scope.unbindScrollEvent();
                    return;
                }

                scope.first = false;

                var html = _.template(scope.listTpl, data);
                scope.$listWrapper.append(html);

                cb && cb(); //有些列表页面刷新以后需要滚动到上次的位置

                //加载结束的场景
                if (data.more == 0) {
                    if (scope.index) {
                        scope.$loadEnd.show();
                    } else {
                        if ($(document).height() - $(window).height() > 0) { //没有满屏不显示
                            scope.$loadEnd.show();
                        }
                    }

                    //                    scope.$loadEnd.show();
                    scope.unbindScrollEvent();
                    return;
                }

            });
        },

        unbindScrollEvent: function() {
            $(window).off('.scollload' + this.id);
        },

        bindScrollEvent: function() {
            this.unbindScrollEvent();

            $(window).on('scroll.scollload' + this.id, $.proxy(function() {
                //如果正在加载便不可用
                if (this.pageData.isLoading) return;

                //滑到最低的时候才能刷新
                if (window.scrollY + document.documentElement.clientHeight < document.documentElement.scrollHeight - 50) return;

                this.initList();

            }, this));
        },

        //跳转至搜索页面
        toSearchAction: function() {
            // 打点
            this.addLog('page:/' + this.logPageName + '>btn:/search', 'page:/search');

            this.forward('search');
        },

        //跳转至医生详情
        toDoctorDetailAction: function(e) {
            var $this = $(e.currentTarget);
            var doctorId = $this.data('id');
            var targetPageName = '';
            var btnName = 'doctor';

            // 打点
            if (this.logPageName == 'doctorlist_consultation' || this.logPageName == 'doctorlist_surgery') {
                targetPageName = 'subscribe_doctor';
            } else {
                targetPageName = 'doctor_homepage';
            }

            if (this.logPageName == 'home') {
                btnName = 'recomment_doctor';
            }

            this.addLog('page:/' + this.logPageName + '>btn:/' + btnName + '/' + doctorId, 'page:/' + targetPageName + '/' + doctorId);

            this.forward('doctordetail', {
                'doctorId': doctorId
            });
        },

        addEvent: function($super) {
            $super();
            this.on('onShow', function() {
                if (this.isDefaultLoading) {
                    this.reloadList();
                }
            });

            this.on('onHide', function() {
                this.unbindScrollEvent();
            });
        }

    });

});