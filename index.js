(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('karas')) :
  typeof define === 'function' && define.amd ? define(['karas'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ParticleLaunch = factory(global.karas));
})(this, (function (karas) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var karas__default = /*#__PURE__*/_interopDefaultLegacy(karas);

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }

        return desc.value;
      };
    }

    return _get.apply(this, arguments);
  }

  var version = "0.9.1";

  var _karas$enums$STYLE_KE = karas__default["default"].enums.STYLE_KEY,
      DISPLAY = _karas$enums$STYLE_KE.DISPLAY,
      VISIBILITY = _karas$enums$STYLE_KE.VISIBILITY,
      TRANSLATE_X = _karas$enums$STYLE_KE.TRANSLATE_X,
      TRANSLATE_Y = _karas$enums$STYLE_KE.TRANSLATE_Y,
      OPACITY = _karas$enums$STYLE_KE.OPACITY,
      SCALE_X = _karas$enums$STYLE_KE.SCALE_X,
      SCALE_Y = _karas$enums$STYLE_KE.SCALE_Y,
      ROTATE_Z = _karas$enums$STYLE_KE.ROTATE_Z,
      _karas$refresh = karas__default["default"].refresh,
      CACHE = _karas$refresh.level.CACHE,
      drawTextureCache = _karas$refresh.webgl.drawTextureCache,
      isNil = karas__default["default"].util.isNil,
      _karas$math = karas__default["default"].math,
      d2r = _karas$math.geom.d2r,
      _karas$math$matrix = _karas$math.matrix,
      identity = _karas$math$matrix.identity,
      isE = _karas$math$matrix.isE,
      multiply = _karas$math$matrix.multiply,
      multiplyTfo = _karas$math$matrix.multiplyTfo,
      tfoMultiply = _karas$math$matrix.tfoMultiply,
      multiplyTranslateX = _karas$math$matrix.multiplyTranslateX,
      multiplyTranslateY = _karas$math$matrix.multiplyTranslateY,
      multiplyRotateZ = _karas$math$matrix.multiplyRotateZ,
      multiplyScaleX = _karas$math$matrix.multiplyScaleX,
      multiplyScaleY = _karas$math$matrix.multiplyScaleY,
      _karas$mode = karas__default["default"].mode,
      CANVAS = _karas$mode.CANVAS,
      WEBGL = _karas$mode.WEBGL,
      css = karas__default["default"].style.css,
      animate = karas__default["default"].animate,
      Img = karas__default["default"].Img,
      inject = karas__default["default"].inject;

  var $ = /*#__PURE__*/function (_karas$Geom) {
    _inherits($, _karas$Geom);

    function $() {
      return _karas$Geom.apply(this, arguments) || this;
    }

    _createClass($, [{
      key: "render",
      value: function render(renderMode, ctx, dx, dy) {
        var _this = this;

        var res = _get(_getPrototypeOf($.prototype), "render", this).call(this, renderMode, ctx, dx, dy);

        var dataList = this.dataList;

        if (!dataList || !dataList.length) {
          return res;
        }

        var root = this.__root;

        if (renderMode !== root.__renderMode) {
          return res;
        }

        var ani = this.ani,
            delay = this.delay,
            animation = this.animation,
            currentTime = this.currentTime,
            duration = this.duration,
            iterations = this.iterations;

        if (ani && currentTime >= delay) {
          var t = currentTime - delay;
          var playCount = Math.min(iterations - 1, Math.floor(currentTime / duration));

          if (playCount >= iterations) {
            return res;
          }

          t -= duration * playCount;
          var i = animate.Animation.binarySearch(0, animation.length - 1, t, animation);
          var notSameFrame = this.lastFrameIndex !== i;
          this.lastFrameIndex = i;
          var frame = animation[i];
          var total;

          if (i >= animation.length - 1) {
            total = animation[i].time;
          } else {
            total = animation[i + 1].time - frame.time;
          }

          var percent = (t - frame.time) / total;
          animate.Animation.calIntermediateStyle(frame, percent, ani, notSameFrame);
        } else {
          ani = null;
        }

        var x1 = this.__x1,
            y1 = this.__y1;
        var globalAlpha;

        if (renderMode === CANVAS) {
          globalAlpha = ctx.globalAlpha;
        }

        var po = this.__computedStyle[OPACITY];
        var env = this.env;
        var cacheList = [],
            lastPage,
            cx = env.width * 0.5,
            cy = env.height * 0.5;
        dataList.forEach(function (item) {
          if (item.loaded) {
            var opacity = po * item.opacity; // 计算位置

            var x = item.nowX + x1 + dx - item.x;
            var y = item.nowY + y1 + dy - item.y;
            var m = identity();
            var img = inject.IMG[item.url];
            var tfo = [item.x + img.width * 0.5, item.y + img.height * 0.5];
            m = tfoMultiply(tfo[0], tfo[1], m); // 移动一半使得图形中心为计算位置的原点，还有平移位置

            m = multiplyTranslateX(m, x - img.width * 0.5);
            m = multiplyTranslateY(m, y - img.height * 0.5); // 如果有path，需要设置且保存当时的位置

            if (ani) {
              var cs;

              if (item.hasOwnProperty('ani')) {
                cs = item.ani;
              } else {
                cs = item.ani = css.cloneStyle(ani.__currentStyle);
              }

              if (cs.hasOwnProperty(TRANSLATE_X)) {
                var tx = cs[TRANSLATE_X].v;
                m = multiplyTranslateX(m, tx);
              }

              if (cs.hasOwnProperty(TRANSLATE_Y)) {
                var ty = cs[TRANSLATE_Y].v;
                m = multiplyTranslateY(m, ty);
              }

              if (cs.hasOwnProperty(OPACITY)) {
                opacity *= cs[OPACITY];
              }

              if (cs.hasOwnProperty(SCALE_X)) {
                m = multiplyScaleX(m, cs[SCALE_X].v);
              }

              if (cs.hasOwnProperty(SCALE_Y)) {
                m = multiplyScaleY(m, cs[SCALE_Y].v);
              }

              if (cs.hasOwnProperty(ROTATE_Z)) {
                m = multiplyRotateZ(m, d2r(cs[ROTATE_Z].v));
              }
            } // 保持方向角度于起点一致性，可以指定angle偏移


            if (!isNil(item.angle)) {
              var r = d2r(item.deg + item.angle);
              m = multiplyRotateZ(m, r);
            }

            if (item.sc && item.sc !== 1) {
              m = multiplyScaleX(m, item.sc);
              m = multiplyScaleY(m, item.sc);
            }

            if (img.width !== item.width) {
              m = multiplyScaleX(m, item.width / img.width);
            }

            if (img.height !== item.height) {
              m = multiplyScaleY(m, item.height / img.height);
            }

            if (renderMode === CANVAS) {
              m = multiplyTfo(m, -tfo[0], -tfo[1]);
              var me = _this.domParent.matrixEvent;

              if (!isE(me)) {
                m = multiply(me, m);
              }

              ctx.globalAlpha = opacity; // canvas处理方式不一样，render的dx和dy包含了total的偏移计算考虑，可以无感知

              ctx.setTransform(m[0], m[1], m[4], m[5], m[12], m[13]);
              ctx.drawImage(item.source, item.x, item.y);
            } else if (renderMode === WEBGL) {
              var cache = item.cache;

              if (!cache) {
                item.cache = true;
                Img.toWebglCache(ctx, root, item.url, item.x, item.y, function (res) {
                  cache = item.cache = res;

                  if (cache.count === 1) {
                    var _cache = cache,
                        _ctx = _cache.ctx,
                        width = _cache.width,
                        height = _cache.height,
                        _x = _cache.x,
                        _y = _cache.y;

                    _ctx.drawImage(item.source, _x, _y, width, height);
                  }
                });
              }

              if (cache && cache !== true) {
                m = multiplyTfo(m, -tfo[0], -tfo[1]);
                var _me = _this.domParent.matrixEvent;

                if (!isE(_me)) {
                  m = multiply(_me, m);
                }

                if (!cache.__available && cache.__enabled) {
                  cache.__available = true;
                }

                if (cache.__available) {
                  if (lastPage && lastPage !== cache.__page) {
                    drawTextureCache(ctx, cacheList.splice(0), cx, cy, dx, dy);
                  }

                  lastPage = cache.__page;
                  cacheList.push({
                    cache: cache,
                    opacity: opacity,
                    matrix: m
                  });
                }
              }
            }
          }
        });

        if (renderMode === CANVAS) {
          ctx.globalAlpha = globalAlpha;
        } else if (renderMode === WEBGL) {
          drawTextureCache(ctx, cacheList, cx, cy, dx, dy);
        }
      }
    }]);

    return $;
  }(karas__default["default"].Geom);

  var uuid = 0;

  var ParticleLaunch = /*#__PURE__*/function (_karas$Component) {
    _inherits(ParticleLaunch, _karas$Component);

    function ParticleLaunch(props) {
      var _this2;

      _this2 = _karas$Component.call(this, props) || this;
      _this2.count = 0;
      _this2.time = 0;
      _this2.playbackRate = props.playbackRate || 1;
      _this2.interval = props.interval || 300;
      _this2.intervalNum = props.intervalNum || 1;
      _this2.num = props.num || 0;
      _this2.__duration = props.duration || 1000;
      _this2.__easing = props.easing;
      return _this2;
    }

    _createClass(ParticleLaunch, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {}
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this3 = this;

        var props = this.props,
            computedStyle = this.shadowRoot.computedStyle,
            renderMode = this.root.renderMode;
        var _props$list = props.list,
            list = _props$list === void 0 ? [] : _props$list,
            _props$initNum = props.initNum,
            initNum = _props$initNum === void 0 ? 0 : _props$initNum,
            _props$delay = props.delay,
            delay = _props$delay === void 0 ? 0 : _props$delay,
            _props$duration = props.duration,
            duration = _props$duration === void 0 ? 1000 : _props$duration,
            _props$iterations = props.iterations,
            iterations = _props$iterations === void 0 ? Infinity : _props$iterations,
            easing = props.easing,
            autoPlay = props.autoPlay,
            animation = props.animation;
        var dataList = [];
        var i = 0,
            length = list.length;
        var lastTime = 0,
            count = 0;
        var fake = this.ref.fake;
        var currentTime = 0,
            maxTime = 0;
        var hasStart; // 分析path，类似waa

        if (Array.isArray(animation) && animation.length > 1) {
          // 偷懒省略animation某个帧时，cloneStyle不报错
          var ani = {
            __currentStyle: css.normalize({
              translateX: 0,
              translateY: 0,
              scale: 1,
              rotateZ: 0,
              opacity: 1
            })
          };
          var pathAni = animate.Animation.parse(animation, duration, easing, ani);
          var keys = animate.Animation.unify(pathAni, ani);
          animate.Animation.calTransition(pathAni, keys, ani);
          fake.ani = ani;
          fake.animation = pathAni;
          fake.currentTime = 0;
          fake.delay = delay;
          fake.iterations = iterations;
          fake.duration = duration;
        }

        var cb = this.cb = function (diff) {
          fake.dataList = null;
          diff *= _this3.playbackRate;
          currentTime += diff;
          fake.currentTime = currentTime;

          if (delay > 0) {
            delay -= diff;
          }

          if (delay <= 0) {
            diff += delay;
            _this3.time += diff;
            delay = 0; // 如果有初始粒子

            if (initNum > 0) {
              lastTime = _this3.time;

              while (initNum-- > 0) {
                i++;
                i %= length;
                count++;

                var o = _this3.genItem(list[i], duration);

                maxTime = Math.max(maxTime, currentTime + o.duration);
                dataList.push(o);
              }
            } // 已有的每个粒子时间增加计算位置，结束的则消失


            for (var j = dataList.length - 1; j >= 0; j--) {
              var item = dataList[j];
              item.time += diff;

              if (item.time >= item.duration) {
                var remove = dataList.splice(j, 1); // webgl需释放纹理

                if (renderMode === WEBGL && remove.length) {
                  remove.forEach(function (item) {
                    item.cache && item.cache.release && item.cache.release();
                  });
                }
              } else if (item.source) {
                var x = item.x,
                    y = item.y,
                    tx = item.tx,
                    ty = item.ty,
                    dx = item.dx,
                    dy = item.dy,
                    time = item.time,
                    _duration = item.duration,
                    _easing = item.easing,
                    blink = item.blink,
                    fade = item.fade,
                    scale = item.scale,
                    direction = item.direction;
                var percent = time / _duration;

                if (_easing) {
                  percent = _easing(percent);
                }

                if (direction === 'reverse') {
                  item.nowX = tx - dx * percent;
                  item.nowY = ty - dy * percent;
                } else {
                  item.nowX = x + dx * percent;
                  item.nowY = y + dy * percent;
                }

                var opacity = 1;

                if (blink) {
                  var num = Math.floor(time / blink.duration);

                  var _diff = time % blink.duration;

                  var _easing2 = blink.easing;

                  var _percent = _diff / blink.duration;

                  if (_easing2) {
                    var timeFunction = animate.easing.getEasing(_easing2);

                    if (timeFunction !== animate.easing.linear) {
                      _percent = timeFunction(_percent);
                    }
                  } // 偶数from2to，奇数to2from


                  if (num % 2 === 0) {
                    opacity *= blink.from + _percent * (blink.to - blink.from);
                  } else {
                    opacity *= blink.to - _percent * (blink.to - blink.from);
                  }
                }

                if (fade) {
                  var p = time / fade.duration;
                  p = Math.max(0, p);
                  p = Math.min(1, p);
                  var _easing3 = fade.easing;

                  if (_easing3) {
                    var _timeFunction = animate.easing.getEasing(_easing3);

                    if (_timeFunction !== animate.easing.linear) {
                      p = _timeFunction(p);
                    }
                  }

                  var alpha = fade.from + (fade.to - fade.from) * p;
                  alpha = Math.max(0, alpha);
                  alpha = Math.min(1, alpha);
                  opacity *= alpha;
                }

                item.opacity = opacity;
                var sc = 1;

                if (scale) {
                  var _p = time / scale.duration;

                  _p = Math.max(0, _p);
                  _p = Math.min(1, _p);
                  var _easing4 = scale.easing;

                  if (_easing4) {
                    var _timeFunction2 = animate.easing.getEasing(_easing4);

                    if (_timeFunction2 !== animate.easing.linear) {
                      _p = _timeFunction2(_p);
                    }
                  }

                  var s = scale.from + (scale.to - scale.from) * _p;
                  sc *= s;
                }

                item.sc = sc;
                item.loaded = true;
                hasStart = true;
              }
            } // 开始后每次都刷新，即便数据已空，要变成空白初始状态


            if (hasStart && currentTime >= delay) {
              if (computedStyle[DISPLAY] !== 'none' && computedStyle[VISIBILITY] !== 'hidden' && computedStyle[OPACITY] > 0) {
                var _this3$props$onFrame, _this3$props;

                fake.dataList = dataList;
                fake.refresh(CACHE);
                (_this3$props$onFrame = (_this3$props = _this3.props).onFrame) === null || _this3$props$onFrame === void 0 ? void 0 : _this3$props$onFrame.call(_this3$props);

                _this3.emit('frame');
              }
            } // 数量完了动画也执行完了停止


            if (count >= _this3.num && currentTime >= maxTime) {
              var _this3$props$onFinish, _this3$props2;

              fake.removeFrameAnimate(cb);
              (_this3$props$onFinish = (_this3$props2 = _this3.props).onFinish) === null || _this3$props$onFinish === void 0 ? void 0 : _this3$props$onFinish.call(_this3$props2);

              _this3.emit('finish');

              return;
            } // 每隔interval开始生成这一阶段的粒子数据


            if (_this3.time >= lastTime + _this3.interval && count < _this3.num) {
              lastTime = _this3.time;

              for (var _j = 0; _j < _this3.intervalNum; _j++) {
                i++;
                i %= length;
                count++;

                var _o = _this3.genItem(list[i], duration);

                maxTime = Math.max(maxTime, currentTime + _o.duration);
                dataList.push(_o);

                if (count >= _this3.num) {
                  break;
                }
              }
            }
          }
        };

        if (autoPlay !== false) {
          fake.frameAnimate(cb);
        }
      }
    }, {
      key: "genItem",
      value: function genItem(item, dur) {
        var width = this.width,
            height = this.height;
        var o = {
          id: uuid++,
          time: 0,
          url: item.url,
          dur: dur
        };

        if (Array.isArray(item.x)) {
          o.x = (item.x[0] + Math.random() * (item.x[1] - item.x[0])) * width;
        } else {
          o.x = item.x * width;
        }

        if (Array.isArray(item.y)) {
          o.y = (item.y[0] + Math.random() * (item.y[1] - item.y[0])) * height;
        } else {
          o.y = item.y * height;
        }

        if (Array.isArray(item.duration)) {
          o.duration = item.duration[0] + Math.random() * (item.duration[1] - item.duration[0]);
        } else {
          o.duration = item.duration || dur;
        }

        if (Array.isArray(item.width)) {
          o.width = item.width[0] + Math.random() * (item.width[1] - item.width[0]);
        } else if (!isNil(item.width)) {
          o.width = item.width;
        }

        if (Array.isArray(item.height)) {
          o.height = item.height[0] + Math.random() * (item.height[1] - item.height[0]);
        } else if (!isNil(item.height)) {
          o.height = item.height;
        }

        var opacity = 1;

        if (Array.isArray(item.opacity)) {
          opacity = item.opacity[0] + Math.random() * (item.opacity[1] - item.opacity[0]);
        } else if (item.opacity !== null && item.opacity !== undefined) {
          opacity = parseFloat(item.opacity);
        }

        o.opacity = opacity;
        var deg = 0;

        if (Array.isArray(item.deg)) {
          deg = item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]);
        } else if (item.deg) {
          deg = item.deg;
        }

        o.deg = deg;
        var angle = parseFloat(item.angle);

        if (item.angle === true) {
          angle = 0;
        }

        if (!isNaN(angle)) {
          o.angle = angle;
        }

        var distance = 0;

        if (Array.isArray(item.distance)) {
          distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
        } else if (item.distance) {
          distance = item.distance * width;
        }

        o.distance = distance;
        o.direction = item.direction;
        var deg2 = deg;

        if (deg >= 270) {
          deg = 360 - deg;
          deg = d2r(deg);
          o.tx = o.x + distance * Math.cos(deg);
          o.ty = o.y - distance * Math.sin(deg);
        } else if (deg >= 180) {
          deg = deg - 180;
          deg = d2r(deg);
          o.tx = o.x - distance * Math.cos(deg);
          o.ty = o.y - distance * Math.sin(deg);
        } else if (deg >= 90) {
          deg = 180 - deg;
          deg = d2r(deg);
          o.tx = o.x - distance * Math.cos(deg);
          o.ty = o.y + distance * Math.sin(deg);
        } else {
          deg = d2r(deg);
          o.tx = o.x + distance * Math.cos(deg);
          o.ty = o.y + distance * Math.sin(deg);
        }

        o.deg = deg2;
        o.dx = o.tx - o.x;
        o.dy = o.ty - o.y;
        ['blink', 'fade', 'scale'].forEach(function (k) {
          if (item[k]) {
            var _item$k = item[k],
                from = _item$k.from,
                to = _item$k.to,
                duration = _item$k.duration,
                easing = _item$k.easing;

            if (Array.isArray(duration)) {
              duration = duration[0] + Math.random() * (duration[1] - duration[0]);
            }

            if (Array.isArray(from)) {
              from = from[0] + Math.random() * (from[1] - from[0]);
            }

            if (Array.isArray(to)) {
              to = to[0] + Math.random() * (to[1] - to[0]);
            }

            o[k] = {
              from: from,
              to: to,
              duration: duration,
              easing: easing
            };
          }
        });

        if (item.easing) {
          o.easing = animate.easing.getEasing(item.easing);
        }

        if (item.url) {
          inject.measureImg(item.url, function (res) {
            if (res.success) {
              o.source = res.source;
              o.sourceWidth = res.width;
              o.sourceHeight = res.height;

              if (!(isNil(o.width) && isNil(o.height))) {
                if (isNil(o.width)) {
                  o.width = res.width / res.height * o.height;
                } else if (isNil(o.height)) {
                  o.height = o.width * res.height / res.width;
                }
              } else {
                o.width = res.width;
                o.height = res.height;
              }
            }
          });
        }

        return o;
      }
    }, {
      key: "pause",
      value: function pause() {
        this.ref.fake.removeFrameAnimate(this.cb);
      }
    }, {
      key: "resume",
      value: function resume() {
        this.ref.fake.frameAnimate(this.cb);
      }
    }, {
      key: "play",
      value: function play() {
        this.count = 0;
        this.time = 0;
        this.ref.fake.removeFrameAnimate(this.cb);
        this.ref.fake.frameAnimate(this.cb);
      }
    }, {
      key: "playbackRate",
      get: function get() {
        return this.__playbackRate;
      },
      set: function set(v) {
        this.__playbackRate = parseFloat(v) || 1;
      }
    }, {
      key: "interval",
      get: function get() {
        return this.__interval;
      },
      set: function set(v) {
        this.__interval = parseInt(v) || 300;
      }
    }, {
      key: "intervalNum",
      get: function get() {
        return this.__intervalNum;
      },
      set: function set(v) {
        this.__intervalNum = parseInt(v) || 1;
      }
    }, {
      key: "num",
      get: function get() {
        return this.__num;
      },
      set: function set(v) {
        if (v === Infinity || /infinity/i.test(v)) {
          this.__num = Infinity;
        } else {
          this.__num = parseInt(v) || 0;
        }
      }
    }, {
      key: "duration",
      get: function get() {
        return this.__duration;
      }
    }, {
      key: "easing",
      get: function get() {
        return this.__easing;
      }
    }, {
      key: "render",
      value: function render() {
        return karas__default["default"].createElement("div", null, karas__default["default"].createElement($, {
          ref: "fake",
          style: {
            width: '100%',
            height: '100%',
            fill: 'none',
            stroke: 0
          }
        }));
      }
    }]);

    return ParticleLaunch;
  }(karas__default["default"].Component);

  ParticleLaunch.version = version;

  return ParticleLaunch;

}));
//# sourceMappingURL=index.js.map
