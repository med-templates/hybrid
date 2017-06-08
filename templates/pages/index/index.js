/**
 * @file  index/index.js
 * @copyright  2017 | Medlinker
 * @date  2017-03-28
 */
define([
    'CommonPath/bind.view',
    'Model',
    'text!./index.html',
    'text!StylePath/common.css',
    'text!./style.css'
], function(
    BaseView,
    Model,
    template,
    commonstyle,
    style
) {
    // 变量初始化

    return BaseView.$extend({
        propertys: function($super) {
            $super();

            this.style = style;
            this.commonstyle = commonstyle;

        }
    })
});