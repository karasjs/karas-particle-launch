# karas-particle-launch
ParticularLaunch component for karas.

---
karas粒子发射组件。

[![NPM version](https://img.shields.io/npm/v/karas-particular-launch.svg)](https://npmjs.org/package/karas-particular-launch)

## Install
```
npm install karas
npm install karas-particular-launch
```

## Usage

```jsx
import ParticleLaunch from 'karas-particular-launch';

karas.render(
  <canvas width="720" height="720">
    <ParticleLaunch style={{
                      width: 300,
                      height: 300,
                    }}
                    list={[{
                      url: 'https://gw.alipayobjects.com/mdn/rms_5922c1/afts/img/A*lW6mQ46eA0MAAAAAAAAAAAAAARQnAQ',
                      x: 0.5,
                      y: 0.5,
                      distance: [0.2, 1.2],
                      deg: [0, 360],
                      width: 5,
                      height: 5,
                      easing: 'ease-out',
                      blink: {
                        from: [0.6, 0.8],
                        to: [0.2, 0.4],
                        duration: [200, 300],
                      },
                      duration: 2000, // 时长
                    }]} // 粒子随机选择位图
                    num={100} // 粒子数量
                    initNum={30} // 初始粒子数量，默认0
                    interval={100} // 每轮发射间隔
                    intervalNum={1} // 每轮发射数量
                    delay={500} // 播放延迟
                    playbackRate={1} // 播放速率
                    autoPlay={false} // 自动播放，非false为自动
    />
  </canvas>
);
```

### method
* pause()
* resume()
* play()

### get/set
* playbackRate 播放速率

# License
[MIT License]
