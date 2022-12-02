# karas-particle-launch
ParticularLaunch component for karas.

---
karas粒子发射组件。

[![NPM version](https://img.shields.io/npm/v/karas-particle-launch.svg)](https://npmjs.org/package/karas-particle-launch)

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
                      angle: 10, // 是否跟随角度旋转，值是对原本图片的偏移量，可以为0
                      width: 5, // width和height只传1个的话意为保持宽高比
                      height: 5,
                      easing: 'ease-out',
                      duration: 2000, // 时长
                      direction: 'reverse', // 反向
                      blink: { // 是否闪烁
                        from: [0.6, 0.8],
                        to: [0.2, 0.4],
                        duration: [200, 300],
                        easing: 'ease-out',
                      },
                      fade: { // 是否透明度变化
                        from: 1,
                        to: [0, 0.2],
                        duration: 2000,
                        easing: 'ease-out',
                      },
                      scale: { // 是否缩放变化
                        from: 1,
                        to: [1.2, 1.6],
                        duration: 2000,
                        easing: 'ease-out',
                      },
                    }]} // 粒子随机选择位图
                    num={100} // 粒子总数限制
                    initNum={30} // 初始粒子数量，默认0
                    interval={100} // 每轮发射间隔
                    intervalNum={1} // 每轮发射数量
                    delay={500} // 播放延迟
                    playbackRate={1} // 播放速率
                    autoPlay={false} // 自动播放，非false为自动
                    easing={'ease-out'}
                    duration={2000}
                    animation={[
                      {
                        translatePath: [0, 0, 50, 100, 100, 0, 150, 50],
                        opacity: 0.1,
                      },
                      {
                        translatePath: [150, 50, 0, 100, 100, 200, 150, 150],
                        opacity: 0.1,
                      },
                      {
                        translateX: 150,
                        translateY: 150,
                        opacity: 0.1,
                      },
                    ]}
    />
  </canvas>
);
```

### props
* onFrame 每帧触发
* onFinish 播放完触发
* animation 粒子整体动画，位移、缩放、选择、透明度可用
* duration 上面选项的时间

### method
* pause() 暂停
* resume() 恢复
* play() 从头播放

### get/set
* playbackRate 播放速率
* interval 发射间隔
* intervalNum 每轮发射数量
* num 总粒子数量

### event
* frame 每次刷新后触发
* finish 完成触发

# License
[MIT License]
