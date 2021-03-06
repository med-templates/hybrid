(function() {

    var project = './';
    var viewRoot = 'pages';
    var templateRoot = 'templates';
    var hybridInfo = _.getHybridInfo();

    var version = 201704251722;
    require.config({
        shim: {
            qiniu: {
                deps: ['uploader'],
                exports: 'Qiniu'
            },
            uploader: {
                exports: 'uploader'
            }
        },
        urlArgs: 'version=' + version,
        paths: {
            //业务频道基类
            BaseView: project + 'common/base.view',
            BindView: project + 'common/bind.view',
            ListView: project + 'common/list.view',

            CommonPath: project + 'common',
            CompPath: project + 'comp',
            PagePath: project + 'pages',

            //所有样式所处地址
            StylePath: project + 'static/css',

            Store: project + 'model/store',
            Model: project + 'model/model',

            CommonUI: project + 'common/ui',
            CommonData: project + 'common/data',

            CommonTpl: project + 'common/tpl'
        }
    });

    var isHybrid = hybridInfo.platform == 'hybrid';
    var modules = ['AbstractApp', 'AbstractStore'];

    if (isHybrid) {
        modules.push('HybridHeader');
    } else {
        modules.push('UIHeader');
    }

    $('document', 'input, textarea')
        .on('focus', function(e) {
            $('.cm-view .fixkeyboard').css('position', 'absolute');
        })
        .on('blur', function(e) {
            $('.cm-view .fixkeyboard').css('position', 'fixed');
            //force page redraw to fix incorrectly positioned fixed elements
            setTimeout(function() {
                window.scrollTo($.mobile.window.scrollLeft(), $.mobile.window.scrollTop());
            }, 20);
        });

    //t为用户期待在该时间后的用户，全部清理缓存再使用
    function initCacheSet(AbstractStore, t) {

        //如果版本更新需要清楚所有缓存便再次设置
        var InitSetStore = _.inherit(AbstractStore, {
            propertys: function($super) {
                $super();
                this.key = 'Sys_VersionStore';
                this.lifeTime = '100D'; //缓存时间
            }
        });
        var store = InitSetStore.getInstance();
        //如果没有记录则直接清理缓存，如果记录存在，但是版本号比当前小，也需要清理缓存
        //最后需要设置新的版本id
        if (!store.get() || store.get() < t) {
            window.localStorage.clear();
            store.set(t)
        }
    }

    require(modules, function(APP, AbstractStore, UIHeader) {
        var _year = 2016;
        var _month = 4;
        var _day = 19;

        //暂时以当天发布时间戳为版本号，期望更新才改这个数据，否则不做更改
        var t = new Date(_year, _month - 1, _day).getTime();
        initCacheSet(AbstractStore, t);

        window.APP = new APP({
            //开启单页应用
            isOpenWebapp: true,
            UIHeader: UIHeader,
            initAppMapping: function() {},
            viewRootPath: viewRoot
        });
        window.APP.initApp();

        //如果处于手白或者地图中，需要去头处理
        if (isHybrid) {
            setTimeout(function() {
                $('body').addClass('baidubox');
            }, 20);
        }
    });

})();