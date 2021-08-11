import karas from 'karas';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

var version = "0.2.0";

var ParticleLaunch = /*#__PURE__*/function (_karas$Component) {
  _inherits(ParticleLaunch, _karas$Component);

  var _super = _createSuper(ParticleLaunch);

  function ParticleLaunch(props) {
    var _this;

    _classCallCheck(this, ParticleLaunch);

    _this = _super.call(this, props);
    _this.count = 0;
    _this.time = 0;
    return _this;
  }

  _createClass(ParticleLaunch, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this2 = this;

      var props = this.props;
      var list = props.list,
          _props$num = props.num,
          num = _props$num === void 0 ? 0 : _props$num,
          _props$interval = props.interval,
          interval = _props$interval === void 0 ? 300 : _props$interval,
          _props$delay = props.delay,
          delay = _props$delay === void 0 ? 0 : _props$delay,
          autoPlay = props.autoPlay;

      if (num === 'infinity' || num === 'Infinity') {
        num = Infinity;
      }

      var dataList = [];
      var i = 0,
          length = list.length,
          first = true;
      var fake = this.ref.fake;

      var cb = this.cb = function (diff) {
        if (delay > 0) {
          delay -= diff;
        }

        if (delay <= 0) {
          diff += delay;
          _this2.time += diff;
          delay = 0; // 已有的每个粒子时间增加计算位置，结束的则消失

          for (var j = dataList.length - 1; j >= 0; j--) {
            var item = dataList[j];
            item.time += diff;

            if (item.time >= item.duration) {
              dataList.splice(j, 1);
            } else {
              var x = item.x,
                  y = item.y,
                  width = item.width,
                  height = item.height,
                  dx = item.dx,
                  dy = item.dy,
                  time = item.time,
                  duration = item.duration,
                  easing = item.easing;
              var percent = time / duration;

              if (easing) {
                percent = easing(percent);
              }

              item.nowX = x + dx * percent - width * 0.5;
              item.nowY = y + dy * percent - height * 0.5;
            }
          }

          if (_this2.count++ >= num) {
            return;
          } // 每隔一段时间增加一个粒子，或者第一个不需要等待


          if (_this2.time >= interval || first) {
            if (first) {
              first = false;
            } else {
              _this2.time -= interval;
            }

            i++;
            i %= length;
            dataList.push(_this2.genItem(list[i]));
          }
        }
      };

      if (autoPlay !== false) {
        fake.frameAnimate(cb);
      }

      var a = this.animation = fake.animate([{
        opacity: 1
      }, {
        opacity: 0
      }], {
        duration: 1000,
        delay: delay,
        iterations: Infinity,
        autoPlay: autoPlay
      });

      fake.render = function (renderMode, lv, ctx) {
        var sx = fake.sx,
            sy = fake.sy;
        var alpha = ctx.globalAlpha;
        var time = a.currentTime - delay;

        if (time < 0) {
          return;
        }

        dataList.forEach(function (item) {
          if (item.source) {
            var blink = item.blink;
            var opacity = alpha;

            if (blink) {
              var _num = Math.floor(time / blink.duration);

              var diff = time % blink.duration; // 偶数from2to，奇数to2from

              if (_num % 2 === 0) {
                opacity *= blink.from - (blink.from - blink.to) * diff / blink.duration;
              } else {
                opacity *= blink.to + (blink.from - blink.to) * diff / blink.duration;
              }
            }

            ctx.globalAlpha = opacity;
            ctx.drawImage(item.source, item.nowX + sx, item.nowY + sy, item.width, item.height);
          }
        });
        ctx.globalAlpha = alpha;
      };
    }
  }, {
    key: "genItem",
    value: function genItem(item) {
      var width = this.width,
          height = this.height;
      var o = {
        x: item.x * width,
        y: item.y * height,
        time: 0
      };

      if (Array.isArray(item.duration)) {
        o.duration = item.duration[0] + Math.random() * (item.duration[1] - item.duration[0]);
      } else {
        o.duration = item.duration;
      }

      if (Array.isArray(item.width)) {
        o.width = item.width[0] + Math.random() * (item.width[1] - item.width[0]);
      } else {
        o.width = item.width;
      }

      if (item.ar) {
        o.height = o.width * item.ar;
      } else {
        if (Array.isArray(item.height)) {
          o.height = item.height[0] + Math.random() * (item.height[1] - item.height[0]);
        } else {
          o.height = item.height;
        }
      }

      var deg = 0;

      if (Array.isArray(item.deg)) {
        deg = item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]);
      } else {
        deg = item.deg;
      }

      var distance = 0;

      if (Array.isArray(item.distance)) {
        distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
      } else {
        distance = item.distance * width;
      }

      if (deg >= 270) {
        deg = 360 - deg;
        deg = karas.math.geom.d2r(deg);
        o.tx = o.x + distance * Math.cos(deg);
        o.ty = o.y - distance * Math.sin(deg);
      } else if (deg >= 180) {
        deg = deg - 180;
        deg = karas.math.geom.d2r(deg);
        o.tx = o.x - distance * Math.cos(deg);
        o.ty = o.y - distance * Math.sin(deg);
      } else if (deg >= 90) {
        deg = 180 - deg;
        deg = karas.math.geom.d2r(deg);
        o.tx = o.x - distance * Math.cos(deg);
        o.ty = o.y + distance * Math.sin(deg);
      } else {
        deg = karas.math.geom.d2r(deg);
        o.tx = o.x + distance * Math.cos(deg);
        o.ty = o.y + distance * Math.sin(deg);
      }

      o.dx = o.tx - o.x;
      o.dy = o.ty - o.y;

      if (item.blink) {
        var _item$blink = item.blink,
            from = _item$blink.from,
            to = _item$blink.to,
            duration = _item$blink.duration;

        if (Array.isArray(duration)) {
          duration = duration[0] + Math.random() * (duration[1] - duration[0]);
        }

        if (Array.isArray(from) && Array.isArray(to)) {
          o.blink = {
            from: from[0] + (Math.random() * from[1] - from[0]),
            to: to[0] + (Math.random() * to[1] - to[0]),
            duration: duration
          };
        }
      }

      if (item.blink) {
        var _item$blink2 = item.blink,
            _from = _item$blink2.from,
            _to = _item$blink2.to,
            _duration = _item$blink2.duration;

        if (Array.isArray(_duration)) {
          _duration = _duration[0] + Math.random() * (_duration[1] - _duration[0]);
        }

        if (Array.isArray(_from) && Array.isArray(_to)) {
          o.blink = {
            from: _from[0] + (Math.random() * _from[1] - _from[0]),
            to: _to[0] + (Math.random() * _to[1] - _to[0]),
            duration: _duration
          };
        }
      }

      if (item.easing) {
        item.easing = karas.animate.easing.getEasing(item.easing);
      }

      if (item.url) {
        karas.inject.measureImg(item.url, function (res) {
          if (res.success) {
            o.source = res.source;
          }
        });
      }

      return o;
    }
  }, {
    key: "pause",
    value: function pause() {
      this.ref.fake.removeFrameAnimate(this.cb);

      if (this.animation) {
        this.animation.pause();
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      this.ref.fake.frameAnimate(this.cb);

      if (this.animation) {
        this.animation.resume();
      }
    }
  }, {
    key: "play",
    value: function play() {
      this.count = 0;
      this.time = 0;
      this.ref.fake.removeFrameAnimate(this.cb);
      this.ref.fake.frameAnimate(this.cb);

      if (this.animation) {
        this.animation.play();
      }
    }
  }, {
    key: "render",
    value: function render() {
      return karas.createElement("div", null, karas.createElement("$polyline", {
        ref: "fake"
      }));
    }
  }]);

  return ParticleLaunch;
}(karas.Component);

ParticleLaunch.version = version;

export { ParticleLaunch as default };
//# sourceMappingURL=index.es.js.map
