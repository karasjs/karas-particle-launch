import karas from 'karas';
import { version } from '../package.json';

const {
  enums: {
    STYLE_KEY: {
      DISPLAY,
      VISIBILITY,
      OPACITY,
    },
    NODE_KEY: {
      NODE_REFRESH_LV,
    },
  },
  refresh: {
    level: {
      REPAINT,
    },
    Cache,
  },
  util: {
    isNil,
    isFunction,
  },
  math: {
    geom: {
      d2r,
    },
    matrix: {
      identity,
      multiply,
    },
  },
  mode: {
    CANVAS,
    WEBGL,
  },
} = karas;

let uuid = 0;

class ParticleLaunch extends karas.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.time = 0;
    this.playbackRate = props.playbackRate || 1;
    this.interval = props.interval || 300;
    this.intervalNum = props.intervalNum || 1;
    this.num = props.num || 0;
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    Object.keys(this.hashImg || {}).forEach(k => {
      this.hashImg[k].release();
    });
    this.hashCache = {};
    this.hashMatrix = {};
    this.hashImg = {};
    this.hashOpacity = {};
  }

  componentDidMount() {
    let { props } = this;
    let { list = [], initNum = 0, delay = 0, autoPlay } = props;
    let dataList = [];
    let i = 0, length = list.length;
    let lastTime = 0, count = 0;
    let fake = this.ref.fake;
    let root = this.root;
    let hashCache = this.hashCache = {};
    let hashMatrix = this.hashMatrix = {};
    let hashImg = this.hashImg = {};
    let hashOpacity = this.hashOpacity = {};
    let hashTfo = this.hashTfo = {};
    let currentTime = 0, maxTime = 0;
    let hasStart;
    let cb = this.cb = diff => {
      diff *= this.playbackRate;
      currentTime += diff;
      if(delay > 0) {
        delay -= diff;
      }
      if(delay <= 0) {
        diff += delay;
        this.time += diff;
        delay = 0;
        // 如果有初始粒子
        if(initNum > 0) {
          lastTime = this.time;
          while(initNum-- > 0) {
            i++;
            i %= length;
            count++;
            let o = this.genItem(list[i]);
            maxTime = Math.max(maxTime, currentTime + o.duration);
            dataList.push(o);
          }
        }
        // 已有的每个粒子时间增加计算位置，结束的则消失
        for(let j = dataList.length - 1; j >= 0; j--) {
          let item = dataList[j];
          item.time += diff;
          if(item.time >= item.duration) {
            dataList.splice(j, 1);
            delete hashCache[item.id];
            delete hashMatrix[item.id];
          }
          else if(item.source) {
            let { x, y, dx, dy, time, duration, easing, blink, fade, scale } = item;
            let percent = time / duration;
            if(easing) {
              percent = easing(percent);
            }
            item.nowX = x + dx * percent;
            item.nowY = y + dy * percent;
            let opacity = 1;
            if(blink) {
              let num = Math.floor(time / blink.duration);
              let diff = time % blink.duration;
              let easing = blink.easing;
              let percent = (blink.to - blink.from) * diff / blink.duration;
              if(easing) {
                let timeFunction = karas.animate.easing.getEasing(easing);
                if(timeFunction !== karas.animate.easing.linear) {
                  percent = timeFunction(percent);
                }
              }
              // 偶数from2to，奇数to2from
              if(num % 2 === 0) {
                opacity *= blink.from + percent;
              }
              else {
                opacity *= blink.to - percent;
              }
            }
            if(fade) {
              let p = time / fade.duration;
              p = Math.max(0, p);
              p = Math.min(1, p);
              let easing = fade.easing;
              if(easing) {
                let timeFunction = karas.animate.easing.getEasing(easing);
                if(timeFunction !== karas.animate.easing.linear) {
                  p = timeFunction(p);
                }
              }
              let alpha = fade.from + (fade.to - fade.from) * p;
              alpha = Math.max(0, alpha);
              alpha = Math.min(1, alpha);
              opacity *= alpha;
            }
            item.opacity = opacity;
            let sc = 1;
            if(scale) {
              let p = time / scale.duration;
              p = Math.max(0, p);
              p = Math.min(1, p);
              let easing = scale.easing;
              if(easing) {
                let timeFunction = karas.animate.easing.getEasing(easing);
                if(timeFunction !== karas.animate.easing.linear) {
                  p = timeFunction(p);
                }
              }
              let s = scale.from + (scale.to - scale.from) * p;
              sc *= s;
            }
            item.sc = sc;
            item.loaded = true;
            hasStart = true;
          }
        }
        // 开始后每次都刷新，即便数据已空，要变成空白初始状态
        if(hasStart) {
          fake.clearCache();
          let p = fake.domParent;
          while (p) {
            p.clearCache(true);
            p = p.domParent;
          }
          root.addForceRefreshTask(() => {
            this.emit('frame');
          });
        }
        if(count >= this.num) {
          if(currentTime >= maxTime) {
            fake.removeFrameAnimate(cb);
          }
          return;
        }
        // 每隔interval开始生成这一阶段的粒子数据
        if(this.time >= lastTime + this.interval) {
          lastTime = this.time;
          for(let j = 0; j < this.intervalNum; j++) {
            i++;
            i %= length;
            count++;
            let o = this.genItem(list[i]);
            maxTime = Math.max(maxTime, currentTime + o.duration);
            dataList.push(o);
            if(count >= this.num) {
              break;
            }
          }
        }
      }
    };
    if(autoPlay !== false) {
      fake.frameAnimate(cb);
    }
    let __config = fake.__config;
    __config[NODE_REFRESH_LV] |= REPAINT;
    let shadowRoot = this.shadowRoot;
    let texCache = this.root.texCache;
    fake.render = (renderMode, lv, ctx, cache, dx = 0, dy = 0) => {
      let time = currentTime - delay;
      if(time < 0) {
        return;
      }
      __config[NODE_REFRESH_LV] |= REPAINT;
      let computedStyle = shadowRoot.computedStyle;
      if(computedStyle[DISPLAY] === 'none'
        || computedStyle[VISIBILITY] === 'hidden'
        || computedStyle[OPACITY] <= 0) {
        return;
      }
      let { sx, sy } = fake;
      let globalAlpha;
      if(renderMode === CANVAS) {
        globalAlpha = ctx.globalAlpha;
      }
      else if(renderMode === WEBGL) {
        globalAlpha = computedStyle[OPACITY];
      }
      dataList.forEach(item => {
        if(item.loaded) {
          let opacity = globalAlpha;
          opacity *= item.opacity;
          // 计算位置
          let x = item.nowX + sx + dx;
          let y = item.nowY + sy + dy;
          let m = identity();
          let tfo = [x + item.width * 0.5, y + item.height * 0.5];
          if(renderMode === CANVAS) {
            m = multiply([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tfo[0], tfo[1], 0, 1], m);
          }
          // 移动一半使得图形中心为计算位置的原点
          m = multiply(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -item.width * 0.5, -item.height * 0.5, 0, 1])
          // 保持方向角度于起点一致性，可以指定direction偏移
          if(!isNil(item.direction)) {
            let r = d2r(item.deg) + d2r(item.direction);
            let t = identity();
            let sin = Math.sin(r);
            let cos = Math.cos(r);
            t[0] = t[5] = cos;
            t[1] = sin;
            t[4] = -sin;
            m = multiply(m, t);
          }
          if(item.sc && item.sc !== 1) {
            let t = identity();
            t[0] = t[5] = t[10] = item.sc;
            m = multiply(m, t);
          }
          if(renderMode === WEBGL) {
            // webgl特殊记录，其tfo如果在局部缓存下偏移量要特殊计算，canvas无感知
            hashTfo[item.id] = tfo;
            let cache = hashCache[item.id];
            if(!cache) {
              let url = item.url;
              if(!hashImg[url]) {
                cache = hashCache[item.id] = Cache.getInstance(
                  [x - 1, y - 1, x + item.sourceWidth + 1, y + item.sourceHeight + 1],
                  x, y
                );
                cache.ctx.drawImage(item.source, x + cache.dx, y + cache.dy)
                hashImg[url] = cache;
              }
              else {
                let c = hashImg[url];
                cache = hashCache[item.id] = new karas.refresh.Cache(
                  c.width, c.height,
                  [x - 1, y - 1, x + item.sourceWidth + 1, y + item.sourceHeight + 1],
                  c.page, c.pos, x, y
                );
              }
            }
            else {
              cache.__bbox = [x - 1, y - 1, x + item.sourceWidth + 1, y + item.sourceHeight + 1];
              cache.__sx = x;
              cache.__sy = y;
            }
            if(item.width !== item.sourceWidth && item.height !== item.sourceHeight) {
              let t2 = identity();
              t2[0] = item.width / item.sourceWidth;
              t2[5] = item.height / item.sourceHeight;
              m = multiply(m, t2);
            }
            hashMatrix[item.id] = m;
            hashOpacity[item.id] = opacity;
          }
          else if(renderMode === CANVAS) {
            ctx.globalAlpha = opacity;
            // canvas处理方式不一样，render的dx和dy包含了total的偏移计算考虑，可以无感知
            m = multiply(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -tfo[0], -tfo[1], 0, 1]);
            // 父级的m
            let pm = this.matrixEvent;
            if(pm) {
              m = multiply(pm, m);
            }
            ctx.setTransform(m[0], m[1], m[4], m[5], m[12], m[13]);
            ctx.drawImage(item.source, x, y, item.width, item.height);
          }
        }
      });
      if(renderMode === CANVAS) {
        ctx.globalAlpha = globalAlpha;
      }
    };
    fake.hookGlRender = function(gl, opacity, matrix, cx, cy, dx, dy, revertY) {
      let computedStyle = shadowRoot.computedStyle;
      if(computedStyle[DISPLAY] === 'none'
        || computedStyle[VISIBILITY] === 'hidden'
        || computedStyle[OPACITY] <= 0) {
        return;
      }
      dataList.forEach(item => {
        if(item.loaded) {
          let id = item.id;
          let tfo = hashTfo[id].slice(0);
          tfo[0] += dx;
          tfo[1] += dy;
          let m = hashMatrix[id];
          m = multiply([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tfo[0], tfo[1], 0, 1], m);
          m = multiply(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -tfo[0], -tfo[1], 0, 1]);
          // 父级的m
          if(matrix) {
            m = multiply(matrix, m);
          }
          texCache.addTexAndDrawWhenLimit(gl, hashCache[id], hashOpacity[id], m, cx, cy, dx, dy, revertY);
        }
      });
    };
  }

  genItem(item) {
    let { width, height, props } = this;
    let o = {
      id: uuid++,
      time: 0,
      url: item.url,
    };
    if(Array.isArray(item.x)) {
      o.x = (item.x[0] + Math.random() * (item.x[1] - item.x[0])) * width;
    }
    else {
      o.x = item.x * width;
    }
    if(Array.isArray(item.y)) {
      o.y = (item.y[0] + Math.random() * (item.y[1] - item.y[0])) * height;
    }
    else {
      o.y = item.y * height;
    }
    if(Array.isArray(item.duration)) {
      o.duration = (item.duration[0] + Math.random() * (item.duration[1] - item.duration[0]));
    }
    else {
      o.duration = item.duration;
    }
    if(Array.isArray(item.width)) {
      o.width = item.width[0] + Math.random() * (item.width[1] - item.width[0]);
    }
    else if(!isNil(item.width)) {
      o.width = item.width;
    }
    if(Array.isArray(item.height)) {
      o.height = item.height[0] + Math.random() * (item.height[1] - item.height[0]);
    }
    else if(!isNil(item.height)) {
      o.height = item.height;
    }
    let deg = 0;
    if(Array.isArray(item.deg)) {
      deg = (item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]));
    }
    else if(item.deg) {
      deg = item.deg;
    }
    o.deg = deg;
    let direction = parseFloat(item.direction);
    if(item.direction === true) {
      direction = 0;
    }
    if(!isNaN(direction)) {
      o.direction = direction;
    }
    let distance = 0;
    if(Array.isArray(item.distance)) {
      distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
    }
    else if(item.distance) {
      distance = item.distance * width;
    }
    if(deg >= 270) {
      deg = 360 - deg;
      deg = karas.math.geom.d2r(deg);
      o.tx = o.x + distance * Math.cos(deg);
      o.ty = o.y - distance * Math.sin(deg);
    }
    else if(deg >= 180) {
      deg = deg - 180;
      deg = karas.math.geom.d2r(deg);
      o.tx = o.x - distance * Math.cos(deg);
      o.ty = o.y - distance * Math.sin(deg);
    }
    else if(deg >= 90) {
      deg = 180 - deg;
      deg = karas.math.geom.d2r(deg);
      o.tx = o.x - distance * Math.cos(deg);
      o.ty = o.y + distance * Math.sin(deg);
    }
    else {
      deg = karas.math.geom.d2r(deg);
      o.tx = o.x + distance * Math.cos(deg);
      o.ty = o.y + distance * Math.sin(deg);
    }
    o.dx = o.tx - o.x;
    o.dy = o.ty - o.y;
    ['blink', 'fade', 'scale'].forEach(k => {
      if(item[k]) {
        let { from, to, duration, easing } = item[k];
        if(Array.isArray(duration)) {
          duration = duration[0] + Math.random() * (duration[1] - duration[0]);
        }
        if(Array.isArray(from)) {
          from = from[0] + Math.random() * (from[1] - from[0]);
        }
        if(Array.isArray(to)) {
          to = to[0] + Math.random() * (to[1] - to[0]);
        }
        o[k] = {
          from,
          to,
          duration,
          easing,
        };
      }
    });
    if(item.easing) {
      o.easing = karas.animate.easing.getEasing(item.easing);
    }
    if(item.url) {
      karas.inject.measureImg(item.url, function(res) {
        if(res.success) {
          o.source = res.source;
          o.sourceWidth = res.width;
          o.sourceHeight = res.height;
          if(!(isNil(o.width) && isNil(o.height))) {
            if(isNil(o.width)) {
              o.width = res.width / res.height * o.height;
            }
            else if(isNil(o.height)) {
              o.height = o.width * res.height / res.width;
            }
          }
          else {
            o.width = res.width;
            o.height = res.height;
          }
        }
      });
    }
    if(props.hookData && isFunction(props.hookData)) {
      o = props.hookData(o);
    }
    return o;
  }

  pause() {
    this.ref.fake.removeFrameAnimate(this.cb);
  }

  resume() {
    this.ref.fake.frameAnimate(this.cb);
  }

  play() {
    this.count = 0;
    this.time = 0;
    this.ref.fake.removeFrameAnimate(this.cb);
    this.ref.fake.frameAnimate(this.cb);
  }

  get playbackRate() {
    return this.__playbackRate;
  }

  set playbackRate(v) {
    this.__playbackRate = parseFloat(v) || 1;
  }

  get interval() {
    return this.__interval;
  }

  get intervalNum() {
    return this.__intervalNum;
  }

  set intervalNum(v) {
    this.__intervalNum = parseInt(v) || 1;
  }

  set interval(v) {
    this.__interval = parseInt(v) || 300;
  }

  get num() {
    return this.__num;
  }

  set num(v) {
    if(v === Infinity || /infinity/i.test(v)) {
      this.__num = Infinity;
    }
    else {
      this.__num = parseInt(v) || 0;
    }
  }

  render() {
    return <div cacheAsBitmap={this.props.cacheAsBitmap}>
      <$polyline ref="fake" style={{width:0,height:0,visibility:'hidden'}}/>
    </div>;
  }
}

ParticleLaunch.version = version;

export default ParticleLaunch;
