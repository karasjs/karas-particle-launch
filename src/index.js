import karas from 'karas';
import { version } from '../package.json';

class ParticleLaunch extends karas.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.time = 0;
    this.playbackRate = props.playbackRate || 1;
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    let { props } = this;
    let { list = [], num = 0, initNum = 0, interval = 300, intervalNum = 1, delay = 0, autoPlay } = props;
    if(num === 'infinity' || num === 'Infinity') {
      num = Infinity;
    }
    let dataList = [];
    let i = 0, length = list.length;
    let lastTime = 0, count = 0;
    let fake = this.ref.fake;
    let cb = this.cb = diff => {
      diff *= this.playbackRate;
      if(delay > 0) {
        delay -= diff;
      }
      if(delay <= 0) {
        diff += delay;
        this.time += diff;
        delay = 0;
        // 如果有初始例子
        if(initNum > 0) {
          lastTime = this.time;
          while(initNum-- > 0) {
            i++;
            i %= length;
            count++;
            dataList.push(this.genItem(list[i]));
          }
        }
        // 已有的每个粒子时间增加计算位置，结束的则消失
        for(let j = dataList.length - 1; j >= 0; j--) {
          let item = dataList[j];
          item.time += diff;
          if(item.time >= item.duration) {
            dataList.splice(j, 1);
          }
          else {
            let { x, y, width, height, dx, dy, time, duration, easing } = item;
            let percent = time / duration;
            if(easing) {
              percent = easing(percent);
            }
            item.nowX = x + dx * percent - width * 0.5;
            item.nowY = y + dy * percent - height * 0.5;
          }
        }
        if(count >= num) {
          return;
        }
        if(this.time >= lastTime + interval) {
          lastTime = this.time;
          for(let j = 0; j < intervalNum; j++) {
            i++;
            i %= length;
            count++;
            dataList.push(this.genItem(list[i]))
            if(count >= num) {
              break;
            }
          }
        }
      }
    };
    if(autoPlay !== false) {
      fake.frameAnimate(cb);
    }
    let a = this.animation = fake.animate([
      {
        opacity: 1,
      },
      {
        opacity: 0,
      }
    ], {
      duration: 1000,
      delay,
      iterations: Infinity,
      autoPlay,
    });
    fake.render = (renderMode, lv, ctx, cache, dx = 0, dy = 0) => {
      let { sx, sy } = fake;
      let alpha = ctx.globalAlpha;
      let time = a.currentTime - delay;
      if(time < 0) {
        return;
      }
      dataList.forEach(item => {
        if(item.source) {
          let blink = item.blink;
          let opacity = alpha;
          if(blink) {
            let num = Math.floor(time / blink.duration);
            let diff = time % blink.duration;
            // 偶数from2to，奇数to2from
            if(num % 2 === 0) {
              opacity *= blink.from + (blink.to - blink.from) * diff / blink.duration;
            }
            else {
              opacity *= blink.to - (blink.to - blink.from) * diff / blink.duration;
            }
          }
          ctx.globalAlpha = opacity;
          ctx.drawImage(item.source, item.nowX + sx + dx, item.nowY + sy + dy, item.width, item.height);
        }
      });
      ctx.globalAlpha = alpha;
    };
  }

  genItem(item) {
    let { width, height } = this;
    let o = {
      time: 0,
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
    else if(!karas.util.isNil(item.width)) {
      o.width = item.width;
    }
    if(Array.isArray(item.height)) {
      o.height = item.height[0] + Math.random() * (item.height[1] - item.height[0]);
    }
    else if(!karas.util.isNil(item.height)) {
      o.height = item.height;
    }
    let deg = 0;
    if(Array.isArray(item.deg)) {
      deg = (item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]));
    }
    else if(deg) {
      deg = item.deg;
    }
    let distance = 0;
    if(Array.isArray(item.distance)) {
      distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
    }
    else if(distance) {
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
    if(item.blink) {
      let { from = 0, to = 1, duration } = item.blink;
      if(Array.isArray(duration)) {
        duration = duration[0] + Math.random() * (duration[1] - duration[0]);
      }
      if(Array.isArray(from) && Array.isArray(to)) {
        o.blink = {
          from: from[0] + (Math.random() * from[1] - from[0]),
          to: to[0] + (Math.random() * to[1] - to[0]),
          duration,
        };
      }
      else {
        o.blink = {
          from: from,
          to: to,
          duration,
        };
      }
    }
    if(item.blink) {
      let { from, to, duration } = item.blink;
      if(Array.isArray(duration)) {
        duration = duration[0] + Math.random() * (duration[1] - duration[0]);
      }
      if(Array.isArray(from)) {
        from = from[0] + Math.random() * (from[1] - from[0]);
      }
      if(Array.isArray(to)) {
        to = to[0] + Math.random() * (to[1] - to[0]);
      }
      o.blink = {
        from,
        to,
        duration,
      };
    }
    if(item.easing) {
      item.easing = karas.animate.easing.getEasing(item.easing);
    }
    if(item.url) {
      karas.inject.measureImg(item.url, function(res) {
        if(res.success) {
          o.source = res.source;
          if(!(karas.util.isNil(o.width) && karas.util.isNil(o.height))) {
            if(karas.util.isNil(o.width)) {
              o.width = res.width / res.height * o.height;
            }
            else if(karas.util.isNil(o.height)) {
              o.height = o.width * res.height / res.width;
            }
          }
        }
      });
    }
    return o;
  }

  pause() {
    this.ref.fake.removeFrameAnimate(this.cb);
    if(this.animation) {
      this.animation.pause();
    }
  }

  resume() {
    this.ref.fake.frameAnimate(this.cb);
    if(this.animation) {
      this.animation.resume();
    }
  }

  play() {
    this.count = 0;
    this.time = 0;
    this.ref.fake.removeFrameAnimate(this.cb);
    this.ref.fake.frameAnimate(this.cb);
    if(this.animation) {
      this.animation.play();
    }
  }

  render() {
    return <div>
      <$polyline ref="fake"/>
    </div>;
  }
}

ParticleLaunch.version = version;

export default ParticleLaunch;
