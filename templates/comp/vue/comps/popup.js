/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-06-01 08:48:42
 * @modify date 2017-06-01 09:16:03
 * @desc 弹出层管理
 */

define([], function() {

    function addClass(el, cls) {
        if (!el) return;
        var curClass = el.className;
        var classes = (cls || '').split(' ');

        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName) continue;

            if (el.classList) {
                el.classList.add(clsName);
            } else {
                if (!hasClass(el, clsName)) {
                    curClass += ' ' + clsName;
                }
            }
        }
        if (!el.classList) {
            el.className = curClass;
        }
    };

    function removeClass(el, cls) {
        if (!el || !cls) return;
        var classes = cls.split(' ');
        var curClass = ' ' + el.className + ' ';

        for (var i = 0, j = classes.length; i < j; i++) {
            var clsName = classes[i];
            if (!clsName) continue;

            if (el.classList) {
                el.classList.remove(clsName);
            } else {
                if (hasClass(el, clsName)) {
                    curClass = curClass.replace(' ' + clsName + ' ', ' ');
                }
            }
        }
        if (!el.classList) {
            el.className = trim(curClass);
        }
    };

    return {
        methods: {
            open: function() {
                var el = this.$el
                    // el.style.display = "block";
                setTimeout(function() {
                    addClass(el, 'in');
                }, 0);
            },
            close: function() {
                var el = this.$el;
                removeClass(el, 'in');
                setTimeout(function() {
                    // el.style.display = "none";
                }, 300)
            }
        }
    }
});