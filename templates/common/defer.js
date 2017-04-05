/**
 * @file 	defer.js
 * @author 	newset (luojieyy@gmail.com)
 * @copyright Copyright (C) 2017 - Medlinker
 *
 * 使用方式
 * defer.start(this)([request, [request]]);
 *
 * request 返回对象
 * request: function(data, success, fail);
 */

define( [], function () {
	function run () {
		var ctx = this;
		var args = Array.prototype.slice.call(arguments),
			_success, _fail, _map = {}, _res = [];

		// 成功
		var __s = 0;

		// 失败
		var __f = 0;

		// 终止
		var __a = 0;

		// 初始化
		var stack = [];
		stack.length = args.length;

		var _promise = {
			then: function(success, fail){
				_success = success;
				_fail = fail;
			}
		}

		function loadAction(k, idx) {
			if (_map.hasOwnProperty(k)) {
				k += new Date().valueOf();
			}
			stack[idx] = k;
			_map[k] = idx;
		}

		function actionSuccessed(key) {
			return function (data) {
				__s++;
				_res[_map[key]] = data;

				if (__s + __f == stack.length) {
					_success.apply(ctx, _res);	
				}
			}
		}

		function actionFailed(key) {
			return function(error) {
				__f++;
				if (__s + __f == stack.length) {
					_success.apply(ctx, _res);	
				}
			}
		}

		_.map(args, function(action, idx) {
			var method = action.shift(),
				ins = action.shift(),
				params = action.shift(), query = action.shift();

			if (!method || !ins) {
				throw 'Invalid Parameters';
			}
			if (params) {
				ins.urlParam = params;
			}

			if (query) {
				ins.setParam(query);
			}

			var k = ins.buildurl()+ JSON.stringify(_.omit(ins.param, 'head'));

			loadAction(k, idx);
			ins[method].call(ins, (actionSuccessed)(k), (actionFailed)(k))
		});

		return _promise;
	}

	return {
		start: function(ctx) {
			return function() {
				return run.apply(ctx, arguments);
			}
		}
	};
} );
