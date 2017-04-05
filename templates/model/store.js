/**
 * @file  model/store.js
 * @copyright  2017 | Medlinker
 * @date  2017-03-28
 *
 * 示例
 *  _.inherit(AbstractStore, {
 *     propertys: function($super) {
 *         $super();
 *         this.key = 'name';
 *         this.lifeTime = '5M';  //缓存时间
 *         this.shouldClear = true;
 *     }
 * })
 * 
 */
define(['AbstractStore'], function(AbstractStore) {
    return {
		// 设备信息
        DevInfo: _.inherit(AbstractStore, {
            propertys: function($super) {
                $super();
                this.key = 'DevInfo';
                this.lifeTime = '1M'; //缓存时间
            }
        })
    };
});