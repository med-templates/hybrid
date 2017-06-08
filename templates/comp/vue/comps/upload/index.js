/**
 * @author luojie
 * @email luojie@medlinker.com
 * @create date 2017-05-27 04:03:05
 * @modify date 2017-05-27 04:03:05
 * @desc [description]
 */
define([], function() {
    'use strict'
    return {
        template: "<div @click='pick'><slot></slot></div>",
        props: ["value"],
        methods: {
            pick: function() {
                this.$ctx.showLoading();

                var _vue = this;
                _.requestHybrid({
                    tagname: 'uploadImage',
                    param: {
                        //业务参数
                        //文件所属分类,包括（transform(出转诊),casem(病例), question(问题), post(帖子), help(求助), secret(深夜病房), logo, avatar(头像)，chat(聊天), idCard(身份证), profile(用户信息),panel, spread, media,live)
                        bucket: 'profile',
                        //1代表文件传入公共盘，所有人可以访问。0代表私人盘，需要授权访问
                        isPublic: 1,
                        //以下是基本参数
                        //1-9张限制
                        count: 1,
                        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    },
                    callback: function(data) {
                        var urls = data.urls;
                        // var urls = ['http://pub-med-avatar.imgs.medlinker.net/male.png'];

                        this.$emit("input", urls[0]);
                        this.$ctx.hideLoading();
                    }.bind(this)
                });
            }
        }
    }
});