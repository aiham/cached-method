(function () {
    'use strict';

    var root = this,
        chai = require('chai'),
        sinon = require('sinon'),
        sinonChai = require('sinon-chai'),
        expect = chai.expect,
        sandbox,
        cachedMethod = require('./'),
        undef = void 0,
        noop = function () {},
        methods = [
            'isEnabled',
            'hasCache',
            'clearCache',
            'disable',
            'enable'
        ],
        sampleMethods = {
            randomInt: function () {
                return Math.random();
            }
        };

    chai.use(sinonChai);

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Cached Method Package', function () {
        describe('cachedMethod#options.method', function () {
            it('should require options.method', function () {
                expect(function () {
                    var transformed = cachedMethod();
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod(undef, {});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod(undef, {method: undef});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod({});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod({method: undef});
                }).to.throw();
            });

            it('should ensure options.method is not a string', function () {
                expect(function () {
                    var transformed = cachedMethod('foo');
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod('foo', {});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod('foo', {method: undef});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod('foo', {method: 'bar'});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod(undef, {method: 'bar'});
                }).to.throw();

                expect(function () {
                    var transformed = cachedMethod({method: 'foo'});
                }).to.throw();
            });

            it('should ensure options.method is a function', function () {
                expect(function () {
                    var transformed = cachedMethod(noop);
                    expect(transformed).to.be.a('function');
                }).not.to.throw();

                expect(function () {
                    var transformed = cachedMethod({method: noop});
                    expect(transformed).to.be.a('function');
                }).not.to.throw();
            });
        });

        describe('cachedMethod#options.context', function () {
            it('should not require options.context', function () {
                expect(function () {
                    var transformed = cachedMethod(noop);
                }).not.to.throw();

                expect(function () {
                    var transformed = cachedMethod(noop, {});
                }).not.to.throw();

                expect(function () {
                    var transformed = cachedMethod(noop, {context: undef});
                }).not.to.throw();
            });
        });

        describe('cachedMethod()', function () {
            var inputs = {
                valid: [
                    [noop],
                    [{method: noop}],
                    [undef, {method: noop}],
                    [noop, {context: context}],
                    [{method: noop, context: context}],
                    [undef, {method: noop, context: context}]
                ]
            };

            it('should return a function', function () {
                inputs.valid.forEach(function (args) {
                    expect(cachedMethod.apply(root, args)).
                        to.be.a('function');
                });
            });

            it('should expose isEnabled(), hasCache(), clearCache(), disable() and enable()', function () {
                inputs.valid.forEach(function (args) {
                    methods.forEach(function (methodName) {
                        expect(cachedMethod.apply(root, args)).
                            to.have.property(methodName).
                            that.is.a('function');
                    });
                });
            });
        });

        describe('transformed()', function () {
            var spy;

            beforeEach(function () {
                spy = sandbox.spy(sampleMethods, 'randomInt');
            });

            afterEach(function () {
                spy.restore();
            });

            it('should set cache', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
            });

            it('should invoke method when it is invoked', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                result = transformed();
                expect(spy).to.have.callCount(1);
            });

            it('should return previously set cache', function () {
                var firstResult,
                    secondResult,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                firstResult = transformed();
                expect(spy).to.have.callCount(1);
                secondResult = transformed();
                expect(spy).to.have.callCount(1);
                expect(firstResult).to.equal(secondResult);
            });

            it('should be invoked with specified context', function () {
                var result,
                    transformed,
                    context = {};

                transformed = cachedMethod(
                    sampleMethods.randomInt,
                    {context: context}
                );
                result = transformed();
                expect(spy).to.have.callCount(1);
                expect(spy.firstCall.thisValue).to.equal(context);
            });

            it('should be invoked with global scope as context when context is not specified', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                result = transformed();
                expect(spy).to.have.callCount(1);
                expect(spy.firstCall.thisValue).to.equal(root);
            });
        });

        describe('transformed.clearCache()', function () {
            it('should set then clear cache', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                transformed.clearCache();
                expect(transformed.hasCache()).to.equal(false);
            });

            it('should not fail if cache has not been set yet', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.hasCache()).to.equal(false);
                expect(function () {
                    transformed.clearCache();
                }).not.to.throw();
                expect(transformed.hasCache()).to.equal(false);
            });

            it('should clear cache of an instance in ioslation of other instances', function () {
                var firstResult,
                    secondResult,
                    firstTransformed,
                    secondTransformed;

                firstTransformed = cachedMethod(sampleMethods.randomInt);
                expect(firstTransformed.hasCache()).to.equal(false);
                firstResult = firstTransformed();
                expect(firstTransformed.hasCache()).to.equal(true);

                secondTransformed = cachedMethod(sampleMethods.randomInt);
                expect(secondTransformed.hasCache()).to.equal(false);
                secondResult = secondTransformed();
                expect(secondTransformed.hasCache()).to.equal(true);
                expect(firstResult).not.to.equal(secondResult);
                secondTransformed.clearCache();
                expect(secondTransformed.hasCache()).to.equal(false);

                expect(secondTransformed()).not.to.equal(firstResult);
                expect(secondTransformed()).not.to.equal(secondResult);

                expect(firstTransformed()).to.equal(firstResult);
                expect(firstTransformed()).not.to.equal(secondResult);
            });
        });

        describe('transformed.disable()', function () {
            it('should disable caching for next call', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                transformed.disable();
                expect(transformed.isEnabled()).to.equal(false);
                expect(transformed()).not.to.equal(result);
            });

            it('should disable caching for all future calls', function () {
                var result,
                    transformed,
                    i;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                transformed.disable();
                expect(transformed.isEnabled()).to.equal(false);

                for (i = 0; i < 10; i++) {
                    expect(transformed()).not.to.equal(result);
                }
            });

            it('should not fail if already disabled', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                transformed.disable();
                expect(transformed.isEnabled()).to.equal(false);
                expect(function () {
                    transformed.disable();
                }).not.to.throw();
                expect(transformed.isEnabled()).to.equal(false);
            });
        });

        describe('transformed.enable()', function () {
            it('should enable caching for next call', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                transformed.disable();
                expect(transformed.isEnabled()).to.equal(false);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(false);
                expect(transformed()).not.to.equal(result);
                transformed.enable();
                expect(transformed.isEnabled()).to.equal(true);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                expect(transformed()).to.equal(result);
            });

            it('should enable caching for all future calls', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                transformed.disable();
                expect(transformed.isEnabled()).to.equal(false);
                expect(transformed.hasCache()).to.equal(false);
                result = transformed();
                expect(transformed.hasCache()).to.equal(false);
                expect(transformed()).not.to.equal(result);
                expect(transformed.hasCache()).to.equal(false);
                expect(transformed()).not.to.equal(result);
                expect(transformed.hasCache()).to.equal(false);
                expect(transformed()).not.to.equal(result);
                expect(transformed.hasCache()).to.equal(false);
                transformed.enable();
                expect(transformed.isEnabled()).to.equal(true);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                expect(transformed()).to.equal(result);
                expect(transformed.hasCache()).to.equal(true);
                expect(transformed()).to.equal(result);
                expect(transformed.hasCache()).to.equal(true);
                expect(transformed()).to.equal(result);
                expect(transformed.hasCache()).to.equal(true);
            });

            it('should not fail if already enabled', function () {
                var result,
                    transformed;

                transformed = cachedMethod(sampleMethods.randomInt);
                expect(transformed.isEnabled()).to.equal(true);
                result = transformed();
                expect(transformed.hasCache()).to.equal(true);
                expect(function () {
                    transformed.enable();
                }).not.to.throw();
                expect(transformed.isEnabled()).to.equal(true);
                expect(transformed()).to.equal(result);
                expect(transformed.hasCache()).to.equal(true);
            });
        });
    });
}());
