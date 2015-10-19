(function () {
    'use strict';

    var root = this,
        undef = void 0;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = cachedMethod;
    } else {
        if (typeof root.cachedMethod !== 'undefined') {
            root.overriddenCachedMethod = root.cachedMethod;
        }
        root.cachedMethod = cachedMethod;
    }

    /**
     * Function wrapper that caches first result. Provides hooks to reset/enable/disable
     * @param  {Function} [method]  The function wrapper
     * @param  {Object} [options] Options
     * @param  {Function} [options.method] The function wrapper, either specify as the first argument or in the options
     * @param  {Object} [options.context] The *this* variable set when the original function is invoked. Defaults to the global scope
     * @return {Function}         Wrapped function with clearCache, disable and enable functions attached to it
     */
    function cachedMethod(method, options) {
        var cache = undef,
            isEnabled = true,
            context = root;

        if (
            arguments.length === 1 &&
            typeof method === 'object' &&
            method !== null
        ) {
            options = method;
            method = undef;
        } else if (typeof options === 'undefined') {
            options = {};
        }

        if (typeof options.method !== 'undefined') {
            method = options.method;
        }

        if (typeof method !== 'function') {
            throw new Error('Invalid method argument. Must be a function');
        }

        if (typeof options.context !== 'undefined') {
            context = options.context;
        }

        function transformed() {
            var result;
            if (!isEnabled || typeof cache === 'undefined') {
                result = method.apply(context, arguments);
                if (isEnabled) {
                    cache = result;
                }
            } else {
                result = cache;
            }
            return result;
        }

        transformed.isEnabled = function () {
            return isEnabled;
        };

        transformed.hasCache = function () {
            return typeof cache !== 'undefined';
        };

        transformed.clearCache = function () {
            cache = undef;
        };

        transformed.disable = function () {
            isEnabled = false;
        };

        transformed.enable = function () {
            isEnabled = true;
        };

        return transformed;
    }
}());
