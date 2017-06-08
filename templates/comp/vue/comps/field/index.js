define([
    'text!./index.html',
], function(html) {
    'use strict';
    return {
        template: html,
        name: "m-field",
        data: function() {
            return {
                currentValue: this.value,
                active: false
            }
        },
        props: {
            value: {},
            readonly: Boolean,
            disabled: Boolean,
            max: Number,
            maxLen: Number,
            type: {
                type: 'String',
                default: 'text'
            },
            placeholder: String,
        },
        methods: {
            handleInput: function(evt) {
                var val = evt.target.value;
                if (this.maxLen && val.length && val.length > this.maxLen) {
                    val = val.substr(0, this.maxLen);
                    evt.target.value = val;
                }
                this.currentValue = val;
            }
        },
        watch: {
            value(val) {
                this.currentValue = val;
            },
            currentValue(val) {
                this.$emit('input', val);
            }
        }
    }
});