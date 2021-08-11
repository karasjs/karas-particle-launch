import karas from 'karas';
import { version } from '../package.json';

class ParticleLaunch extends karas.Component {
  constructor(props) {
    super(props);
    this.count = 0;
    this.time = 0;
  }

  componentDidMount() {
    let { props } = this;
    let { list, num = 0, interval = 300, delay = 0, autoPlay } = props;
    if(num === 'infinity' || num === 'Infinity') {
      num = Infinity;
    }
    let dataList = [];
    let i = 0, length = list.length, first = true;
    let fake = this.ref.fake;
    let cb = this.cb = diff => {
      if(delay > 0) {
        delay -= diff;
      }
      if(delay <= 0) {
        diff += delay;
        this.time += diff;
        delay = 0;
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
        if(this.count++ >= num) {
          return;
        }
        // 每隔一段时间增加一个粒子，或者第一个不需要等待
        if(this.time >= interval || first) {
          if(first) {
            first = false;
          }
          else {
            this.time -= interval;
          }
          i++;
          i %= length;
          dataList.push(this.genItem(list[i]));
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
    fake.render = (renderMode, lv, ctx) => {
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
              opacity *= blink.from - (blink.from - blink.to) * diff / blink.duration;
            }
            else {
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

  genItem(item) {
    let { width, height } = this;
    let o = {
      x: item.x * width,
      y: item.y * height,
      time: 0,
    };
    if(Array.isArray(item.duration)) {
      o.duration = (item.duration[0] + Math.random() * (item.duration[1] - item.duration[0]));
    }
    else {
      o.duration = item.duration;
    }
    if(Array.isArray(item.width)) {
      o.width = item.width[0] + Math.random() * (item.width[1] - item.width[0]);
    }
    else {
      o.width = item.width;
    }
    if(item.ar) {
      o.height = o.width * item.ar;
    }
    else {
      if(Array.isArray(item.height)) {
        o.height = item.height[0] + Math.random() * (item.height[1] - item.height[0]);
      }
      else {
        o.height = item.height;
      }
    }
    let deg = 0;
    if(Array.isArray(item.deg)) {
      deg = (item.deg[0] + Math.random() * (item.deg[1] - item.deg[0]));
    }
    else {
      deg = item.deg;
    }
    let distance = 0;
    if(Array.isArray(item.distance)) {
      distance = (item.distance[0] + Math.random() * (item.distance[1] - item.distance[0])) * width;
    }
    else {
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
      let { from, to, duration } = item.blink;
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
    }
    if(item.blink) {
      let { from, to, duration } = item.blink;
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
    }
    if(item.easing) {
      item.easing = karas.animate.easing.getEasing(item.easing);
    }
    if(item.url) {
      karas.inject.measureImg(item.url, function(res) {
        if(res.success) {
          o.source = res.source;
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
