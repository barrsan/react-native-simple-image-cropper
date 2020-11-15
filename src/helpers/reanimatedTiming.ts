import Animated, { add } from 'react-native-reanimated';

const {
  Clock,
  Value,
  block,
  cond,
  stopClock,
  set,
  startClock,
  clockRunning,
  not,
  timing: reTiming,
} = Animated;

interface ITimingAnimation {
  state: Animated.TimingState;
  config: Animated.TimingConfig;
}

interface IAnimateParams<S, C> {
  clock: Animated.Clock;
  fn: (
    clock: Animated.Clock,
    state: S,
    config: C,
  ) => Animated.Adaptable<number>;
  state: S;
  config: C;
  from: Animated.Adaptable<number>;
}

export interface ITimingParams {
  clock?: Animated.Clock;
  from?: Animated.Adaptable<number>;
  to?: Animated.Adaptable<number>;
  duration?: Animated.Adaptable<number>;
  easing?: (v: Animated.Adaptable<number>) => Animated.Node<number>;
}

const animate = <T extends ITimingAnimation>({
  fn,
  clock,
  state,
  config,
  from,
}: IAnimateParams<T['state'], T['config']>) =>
  block([
    cond(not(clockRunning(clock)), [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, from),
      startClock(clock),
    ]),
    fn(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ]);

const timing = (params: ITimingParams) => {
  const { clock, easing, duration, from, to } = {
    clock: new Clock(),
    duration: 250,
    from: 0,
    to: 1,
    easing: (v: Animated.Adaptable<number>) => add(v, 0),
    ...params,
  };

  const state: Animated.TimingState = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    toValue: new Value(0),
    duration,
    easing,
  };

  return block([
    cond(not(clockRunning(clock)), [
      set(config.toValue, to),
      set(state.frameTime, 0),
    ]),
    animate<ITimingAnimation>({
      clock,
      fn: reTiming,
      state,
      config,
      from,
    }),
  ]);
};

export { timing };
