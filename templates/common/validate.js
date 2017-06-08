/**
 * @file  common/validate.js
 * @author  newset (luojieyy@gmail.com)
 * @copyright  2017 | Medlinker
 * @date  2017-05-04
 */
define(['cValidate'], function(cValidate) {

    /**
     * 大写首字母
     * @param  {string} val 
     */
    function cap(val) {
        return val.substr(0, 1).toUpperCase() + val.substr(1);
    }

    /**
     * 是否为空值
     */
    function empty(value) {
        return (value == undefined) || (value === "") || (value === null);
    }

    return {
        /**
         * 单个字段校验
         */
        field: function(value, rule) {
            if (!rule) {
                return value && value.trim();
            }
            var valid = true;
            var rules = rule.split("|");
            for (var i = 0; i < rules.length; i++) {
                var item = rules[i];
                switch (item) {
                    case 'required':
                        valid = empty(value) ? false : true;
                        break;
                    case 'check':
                        valid = value == true ? true : false;
                        break;
                    default:
                        valid = cValidate['is' + cap(item)](value) ? true : false;
                        break;
                }

                if (valid != true) {
                    return valid;
                }
            }

            return valid;
        },
        /**
         * 循环fields 校验
         */
        walk: function(fields, data) {
            for (var field in fields) {
                var val = data[field];
                if (!this.field(val, fields[field])) {
                    return field;
                };
            }

            return true;
        }
    }
});