import karas from 'karas';
import { version } from '../package.json';

const {
  enums: {
    STYLE_KEY: {
      DISPLAY,
      VISIBILITY,
      TRANSLATE_X,
      TRANSLATE_Y,
      OPACITY,
      SCALE_X,
      SCALE_Y,
      ROTATE_Z,
    },
  },
  refresh: {
    level: {
      CACHE,
    },
    webgl: {
      drawTextureCache,
    },
  },
  util: {
    isNil,
  },
  math: {
    geom: {
      d2r,
    },
    matrix: {
      identity,
      isE,
      multiply,
      multiplyTfo,
      tfoMultiply,
      multiplyTranslateX,
      multiplyTranslateY,
      multiplyRotateZ,
      multiplyScaleX,
      multiplyScaleY,
    },
  },
  mode: {
    CANVAS,
    WEBGL,
  },
  style: {
    css,
  },
  animate,
  Img,
  inject,
} = karas;

class $ extends karas.Geom {
  render(renderMode, ctx, dx, dy) {
    let res = super.render(renderMode, ctx, dx, dy);
    let dataList = this.dataList;
    if(!dataList || !dataList.length) {
      return res;
    }
    let root = this.__root;
    if(renderMode !== root.__renderMode) {
      return res;
    }
    let ani = this.ani, delay = this.delay, animation = this.animation, currentTime = this.currentTime,
      duration = this.duration, iterations = this.iterations;
    if(ani && currentTime >= delay) {
      let t = currentTime - delay;
      let playCount = Math.min(iterations - 1, Math.floor(currentTime / duration));
      if(playCount >= iterations) {
        return res;
      }
      t -= duration * playCount;
      let i = animate.Animation.binarySearch(0, animation.length - 1, t, animation);
      let notSameFrame = this.lastFrameIndex !== i;
      this.lastFrameIndex = i;
      let frame = animation[i];
      let total;
      if(i >= animation.length - 1) {
        total = animation[i].time;
      }
      else {
        total = animation[i + 1].time - frame.time;
      }
      let percent = (t - frame.time) / total;
      animate.Animation.calIntermediateStyle(frame, percent, ani, notSameFrame);
    }
    else {
      ani = null;
    }
    let { __x1: x1, __y1: y1 } = this;
    let globalAlpha;
    if(renderMode === CANVAS) {
      globalAlpha = ctx.globalAlpha;
    }
    let po = this.__computedStyle[OPACITY];
    let env = this.env;
    let cacheList = [], lastPage, cx = env.width * 0.5, cy = env.height * 0.5;
    dataList.forEach(item => {
      if(item.loaded) {
        let opacity = po * item.opacity;
        // 计算位置
        let x = item.nowX + x1 + dx - item.x;
        let y = item.nowY + y1 + dy - item.y;
        let m = identity();
        let img = inject.IMG[item.url];
        let tfo = [item.x + img.width * 0.5, item.y + img.height * 0.5];
        m = tfoMultiply(tfo[0], tfo[1], m);
        // 移动一半使得图形中心为计算位置的原点，还有平移位置
        m = multiplyTranslateX(m, x - img.width * 0.5);
        m = multiplyTranslateY(m, y - img.height * 0.5);
        // 如果有path，需要设置且保存当时的位置
        if(ani) {
          let cs;
          if(item.hasOwnProperty('ani')) {
            cs = item.ani;
          }
          else {
            cs = item.ani = css.cloneStyle(ani.__currentStyle);
          }
          if(cs.hasOwnProperty(TRANSLATE_X)) {
            let tx = cs[TRANSLATE_X].v;
            m = multiplyTranslateX(m, tx);
          }
          if(cs.hasOwnProperty(TRANSLATE_Y)) {
            let ty = cs[TRANSLATE_Y].v;
            m = multiplyTranslateY(m, ty);
          }
          if(cs.hasOwnProperty(OPACITY)) {
            opacity *= cs[OPACITY];
          }
          if(cs.hasOwnProperty(SCALE_X)) {
            m = multiplyScaleX(m, cs[SCALE_X].v);
          }
          if(cs.hasOwnProperty(SCALE_Y)) {
            m = multiplyScaleY(m, cs[SCALE_Y].v);
          }
          if(cs.hasOwnProperty(ROTATE_Z)) {
            m = multiplyRotateZ(m, d2r(cs[ROTATE_Z].v));
          }
        }
        // 保持方向角度于起点一致性，可以指定angle偏移
        if(!isNil(item.angle)) {
          let r = d2r(item.deg + item.angle);
          m = multiplyRotateZ(m, r);
        }
        if(item.sc && item.sc !== 1) {
          m = multiplyScaleX(m, item.sc);
          m = multiplyScaleY(m, item.sc);
        }
        if(img.width !== item.width) {
          m = multiplyScaleX(m, item.width / img.width);
        }
        if(img.height !== item.height) {
          m = multiplyScaleY(m, item.height / img.height);
        }
        if(renderMode === CANVAS) {
          m = multiplyTfo(m, -tfo[0], -tfo[1]);
          let me = this.domParent.matrixEvent;
          if(!isE(me)) {
            m = multiply(me, m);
          }
          ctx.globalAlpha = opacity;
          // canvas处理方式不一样，render的dx和dy包含了total的偏移计算考虑，可以无感知
          ctx.setTransform(m[0], m[1], m[4], m[5], m[12], m[13]);
          ctx.drawImage(item.source, item.x, item.y);
        }
        else if(renderMode === WEBGL) {
          let cache = item.cache;
          if(!cache) {
            item.cache = true;
            Img.toWebglCache(ctx, root, item.url, item.x, item.y, function(res) {
              cache = item.cache = res;
              if(cache.count === 1) {
                let { ctx, width, height, x, y } = cache;
                ctx.drawImage(item.source, x, y, width, height);
              }
            });
          }
          if(cache && cache !== true) {
            m = multiplyTfo(m, -tfo[0], -tfo[1]);
            let me = this.domParent.matrixEvent;
            if(!isE(me)) {
              m = multiply(me, m);
            }
            if(!cache.__available && cache.__enabled) {
              cache.__available = true;
            }
            if(cache.__available) {
              if(lastPage && lastPage !== cache.__page) {
                drawTextureCache(ctx, cacheList.splice(0), cx, cy, dx, dy);
              }
              lastPage = cache.__page;
              cacheList.push({ cache, opacity, matrix: m });
            }
          }
        }
      }
    });
    if(renderMode === CANVAS) {
      ctx.globalAlpha = globalAlpha;
    }
    else if(renderMode === WEBGL) {
      drawTextureCache(ctx, cacheList, cx, cy, dx, dy);
    }
  }
}

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
    this.__duration = props.duration || 1000;
    this.__easing = props.easing;
  }

  componentWillUnmount() {
    (this.dataList || []).forEach(item => {
      item.cache && item.cache.release && item.cache.release();
    });
  }

  componentDidMount() {
    let { props, shadowRoot: { computedStyle }, root: { renderMode } } = this;
    let { list = [], initNum = 0, delay = 0, duration = 1000, iterations = Infinity, easing, autoPlay, animation } = props;
    let dataList = this.dataList = [];
    let i = 0, length = list.length;
    let lastTime = 0, count = 0;
    let fake = this.ref.fake;
    let currentTime = 0, maxTime = 0;
    let hasStart;
    // 分析path，类似waa
    if(Array.isArray(animation) && animation.length > 1) {
      // 偷懒省略animation某个帧时，cloneStyle不报错
      let ani = {
        __currentStyle: css.normalize({
          translateX: 0,
          translateY: 0,
          scale: 1,
          rotateZ: 0,
          opacity: 1,
        }),
      };
      let pathAni = animate.Animation.parse(animation, duration, easing, ani);
      let keys = animate.Animation.unify(pathAni, ani);
      animate.Animation.calTransition(pathAni, keys, ani);
      fake.ani = ani;
      fake.animation = pathAni;
      fake.currentTime = 0;
      fake.delay = delay;
      fake.iterations = iterations;
      fake.duration = duration;
    }
    let cb = this.cb = diff => {
      fake.dataList = null;
      diff *= this.playbackRate;
      currentTime += diff;
      fake.currentTime = currentTime;
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
            let o = this.genItem(list[i], duration);
            maxTime = Math.max(maxTime, currentTime + o.duration);
            dataList.push(o);
          }
        }
        // 已有的每个粒子时间增加计算位置，结束的则消失
        for(let j = dataList.length - 1; j >= 0; j--) {
          let item = dataList[j];
          item.time += diff;
          if(item.time >= item.duration) {
            let remove = dataList.splice(j, 1);
            // webgl需释放纹理
            if(renderMode === WEBGL && remove.length) {
              remove.forEach(item => {
                item.cache && item.cache.release && item.cache.release();
              });
            }
          }
          else if(item.source) {
            let { x, y, tx, ty, dx, dy, time, duration, easing, blink, fade, scale, direction } = item;
            let percent = time / duration;
            if(easing) {
              percent = easing(percent);
            }
            if(direction === 'reverse') {
              item.nowX = tx - dx * percent;
              item.nowY = ty - dy * percent;
            }
            else {
              item.nowX = x + dx * percent;
              item.nowY = y + dy * percent;
            }
            let opacity = 1;
            if(blink) {
              let num = Math.floor(time / blink.duration);
              let diff = time % blink.duration;
              let easing = blink.easing;
              let percent = diff / blink.duration;
              if(easing) {
                let timeFunction = animate.easing.getEasing(easing);
                if(timeFunction !== animate.easing.linear) {
                  percent = timeFunction(percent);
                }
              }
              // 偶数from2to，奇数to2from
              if(num % 2 === 0) {
                opacity *= blink.from + percent * (blink.to - blink.from);
              }
              else {
                opacity *= blink.to - percent * (blink.to - blink.from);
              }
            }
            if(fade) {
              let p = time / fade.duration;
              p = Math.max(0, p);
              p = Math.min(1, p);
              let easing = fade.easing;
              if(easing) {
                let timeFunction = animate.easing.getEasing(easing);
                if(timeFunction !== animate.easing.linear) {
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
                let timeFunction = animate.easing.getEasing(easing);
                if(timeFunction !== animate.easing.linear) {
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
        if(hasStart && currentTime >= delay) {
          if(computedStyle[DISPLAY] !== 'none' && computedStyle[VISIBILITY] !== 'hidden' && computedStyle[OPACITY] > 0) {
            fake.dataList = dataList;
            fake.refresh(CACHE);
            this.props.onFrame?.();
            this.emit('frame');
          }
        }
        // 数量完了动画也执行完了停止
        if(count >= this.num && currentTime >= maxTime) {
          fake.removeFrameAnimate(cb);
          this.props.onFinish?.();
          this.emit('finish');
          return;
        }
        // 每隔interval开始生成这一阶段的粒子数据
        if(this.time >= lastTime + this.interval && count < this.num) {
          lastTime = this.time;
          for(let j = 0; j < this.intervalNum; j++) {
            i++;
            i %= length;
            count++;
            let o = this.genItem(list[i], duration);
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
  }

  genItem(item, dur) {
    let { width, height } = this;
    let o = {
      id: uuid++,
      time: 0,
      url: item.url,
      dur,
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
      o.duration = item.duration || dur;
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
    let opacity = 1;
    if(Array.isArray(item.opacity)) {
      opacity = item.opacity[0] + Math.random() * (item.opacity[1] - item.opacity[0]);
    }
    else if(item.opacity !== null && item.opacity !== undefined) {
      opacity = parseFloat(item.opacity);
    }
    o.opacity = opacity;
    let deg = 0;
    if(Array.isArray(item.deg)) {
      deg = item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]);
    }
    else if(item.deg) {
      deg = item.deg;
    }
    o.deg = deg;
    let angle = parseFloat(item.angle);
    if(item.angle === true) {
      angle = 0;
    }
    if(!isNaN(angle)) {
      o.angle = angle;
    }
    let distance = 0;
    if(Array.isArray(item.distance)) {
      distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
    }
    else if(item.distance) {
      distance = item.distance * width;
    }
    o.distance = distance;
    o.direction = item.direction;
    let deg2 = deg;
    if(deg >= 270) {
      deg = 360 - deg;
      deg = d2r(deg);
      o.tx = o.x + distance * Math.cos(deg);
      o.ty = o.y - distance * Math.sin(deg);
    }
    else if(deg >= 180) {
      deg = deg - 180;
      deg = d2r(deg);
      o.tx = o.x - distance * Math.cos(deg);
      o.ty = o.y - distance * Math.sin(deg);
    }
    else if(deg >= 90) {
      deg = 180 - deg;
      deg = d2r(deg);
      o.tx = o.x - distance * Math.cos(deg);
      o.ty = o.y + distance * Math.sin(deg);
    }
    else {
      deg = d2r(deg);
      o.tx = o.x + distance * Math.cos(deg);
      o.ty = o.y + distance * Math.sin(deg);
    }
    o.deg = deg2;
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
      o.easing = animate.easing.getEasing(item.easing);
    }
    if(item.url) {
      inject.measureImg(item.url, function(res) {
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

  get duration() {
    return this.__duration;
  }

  get easing() {
    return this.__easing;
  }

  render() {
    return <div>
      <$ ref="fake" style={{
        width: '100%',
        height: '100%',
        fill: 'none',
        stroke: 0,
      }}/>
    </div>;
  }
}

ParticleLaunch.version = version;

export default ParticleLaunch;
