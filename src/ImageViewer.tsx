import React, { Component, RefObject, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  TapGestureHandler,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, { Easing, max } from 'react-native-reanimated';
import { timing } from 'react-native-redash';
import { IImageViewerData, IConstraints } from './types';

interface IProps {
  image: string;
  areaWidth: number;
  areaHeight: number;
  imageWidth: number;
  imageHeight: number;
  onMove: ({ positionX, positionY, scale }: IImageViewerData) => void;
  containerColor?: string;
  imageBackdropColor?: string;
  overlay?: ReactNode;
  minScale?: number;
  constraints?: IConstraints;
}

const defaultProps = {
  containerColor: 'black',
  imageBackdropColor: 'black',
};

const {
  Value,
  event,
  block,
  set,
  cond,
  eq,
  and,
  greaterThan,
  greaterOrEq,
  lessThan,
  add,
  sub,
  multiply,
  divide,
  call,
} = Animated;

const styles = StyleSheet.create({
  panGestureInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {},
});

class ImageViewer extends Component<IProps> {
  pinchRef: RefObject<PinchGestureHandler>;

  dragRef: RefObject<PanGestureHandler>;

  translateX: Animated.Value<number>;

  translateY: Animated.Value<number>;

  scale: Animated.Value<number>;

  onTapGestureEvent: (...args: any[]) => void;

  onPanGestureEvent: (...args: any[]) => void;

  onPinchGestureEvent: (...args: any[]) => void;

  static defaultProps = defaultProps;

  constructor(props: IProps) {
    super(props);

    const {
      areaWidth,
      areaHeight,
      imageWidth,
      imageHeight,
      constraints,
    } = props;

    this.pinchRef = React.createRef();
    this.dragRef = React.createRef();

    this.translateX = new Value(0);
    this.translateY = new Value(0);
    this.scale = new Value(1);

    const timingDefaultParams = {
      duration: 200,
      easing: Easing.linear,
    };

    const maxScale = 1 + 3;

    const offsetX = new Value(0);
    const offsetY = new Value(0);
    const offsetZ = new Value(1);

    const viewerAreaWidth = new Value(areaWidth);
    const viewerAreaHeight = new Value(areaHeight);

    const viewerImageWidth = new Value(imageWidth);
    const viewerImageHeight = new Value(imageHeight);

    const scaledWidth = multiply(viewerImageWidth, this.scale);
    const scaledHeight = multiply(viewerImageHeight, this.scale);

    const constraintsValues = {
      offset: {
        x: new Value(constraints?.offset.x || 0),
        y: new Value(constraints?.offset.y || 0),
      },
      // if no constraints, we can go to whole area size
      size: {
        width: constraints?.size.width
          ? new Value(constraints.size.width)
          : viewerAreaWidth,
        height: constraints?.size.height
          ? new Value(constraints.size.height)
          : viewerAreaHeight,
      },
    };

    // when scaling, the translation origin is shifted from
    // intitial origin: this value is the actual shift
    const scalingOriginShiftX = divide(sub(viewerAreaWidth, scaledWidth), 2);
    const scalingOriginShiftY = divide(sub(viewerAreaHeight, scaledHeight), 2);

    // blocked by constraint left edge
    const leftMarginX = constraintsValues.offset.x;
    const translateXMax = divide(
      sub(leftMarginX, scalingOriginShiftX),
      this.scale,
    );

    // blocked by constraint rigth edge
    const rightMarginX = add(
      constraintsValues.offset.x,
      constraintsValues.size.width,
    );
    const translateXMin = divide(
      sub(rightMarginX, scaledWidth, scalingOriginShiftX),
      this.scale,
    );

    // blocked by constraint top edge
    const topMarginY = constraintsValues.offset.y;
    const translateYMax = divide(
      sub(topMarginY, scalingOriginShiftY),
      this.scale,
    );

    // blocked by constraint bottom egde
    const bottomMarginY = add(
      constraintsValues.offset.y,
      constraintsValues.size.height,
    );
    const translateYMin = divide(
      sub(bottomMarginY, scaledHeight, scalingOriginShiftY),
      this.scale,
    );

    const enforceConstraints = block([
      cond(lessThan(this.translateX, translateXMin), [
        set(
          this.translateX,
          timing({
            from: this.translateX,
            to: translateXMin,
            ...timingDefaultParams,
          }),
        ),
      ]),
      cond(greaterThan(this.translateX, translateXMax), [
        set(
          this.translateX,
          timing({
            from: this.translateX,
            to: translateXMax,
            ...timingDefaultParams,
          }),
        ),
      ]),
      cond(lessThan(this.translateY, translateYMin), [
        set(
          this.translateY,
          timing({
            from: this.translateY,
            to: translateYMin,
            ...timingDefaultParams,
          }),
        ),
      ]),
      cond(greaterThan(this.translateY, translateYMax), [
        set(
          this.translateY,
          timing({
            from: this.translateY,
            to: translateYMax,
            ...timingDefaultParams,
          }),
        ),
      ]),
    ]);

    const minScale = props.minScale
      ? new Value(props.minScale)
      : // scaledWidth < constraint.width && scaledHeight < constraint.width
        max(
          divide(constraintsValues.size.width, viewerImageWidth),
          divide(constraintsValues.size.height, viewerImageHeight),
        );

    this.onTapGestureEvent = event([
      {
        nativeEvent: ({ state }: { state: State }) =>
          block([
            cond(eq(state, State.END), [
              set(offsetZ, minScale),
              set(offsetX, new Value(0)),
              set(offsetY, new Value(0)),

              set(
                this.scale,
                timing({
                  from: this.scale,
                  to: minScale,
                  ...timingDefaultParams,
                }),
              ),

              set(
                this.translateX,
                timing({
                  from: this.translateX,
                  to: 0,
                  ...timingDefaultParams,
                }),
              ),

              set(
                this.translateY,
                timing({
                  from: this.translateY,
                  to: 0,
                  ...timingDefaultParams,
                }),
              ),
            ]),
          ]),
      },
    ]);

    this.onPanGestureEvent = event([
      {
        nativeEvent: ({
          translationX,
          translationY,
          state,
        }: {
          translationX: number;
          translationY: number;
          state: State;
        }) =>
          block([
            cond(eq(state, State.ACTIVE), [
              set(
                this.translateX,
                add(divide(translationX, this.scale), offsetX),
              ),
              set(
                this.translateY,
                add(divide(translationY, this.scale), offsetY),
              ),
            ]),

            cond(eq(state, State.END), enforceConstraints),

            cond(eq(state, State.END), [
              set(offsetX, this.translateX),
              set(offsetY, this.translateY),
            ]),
          ]),
      },
    ]);

    this.onPinchGestureEvent = event([
      {
        nativeEvent: ({ scale, state }: { scale: number; state: State }) =>
          block([
            cond(
              and(
                eq(state, State.ACTIVE),
                greaterOrEq(multiply(offsetZ, scale), minScale),
              ),
              set(this.scale, multiply(offsetZ, scale)),
            ),

            cond(eq(state, State.END), [set(offsetZ, this.scale)]),
            // todo: activate this leads to weird stutter effects
            // cond(eq(state, State.END), enforceConstraints),
            cond(
              and(
                eq(state, State.END),
                greaterThan(this.scale, new Value(maxScale)),
              ),
              [
                set(offsetZ, new Value(maxScale)),
                set(
                  this.scale,
                  timing({
                    from: this.scale,
                    to: maxScale,
                    ...timingDefaultParams,
                  }),
                ),
              ],
            ),
          ]),
      },
    ]);
  }

  handleMove = (args: readonly number[]): void => {
    const { onMove } = this.props;

    const positionX = args[0];
    const positionY = args[1];
    const scale = args[2];

    onMove({ positionX, positionY, scale });
  };

  render() {
    const {
      image,
      imageWidth,
      imageHeight,
      areaWidth,
      areaHeight,
      containerColor,
      imageBackdropColor,
      overlay,
    } = this.props;

    const imageSrc = {
      uri: image,
    };

    const containerStyles = [
      styles.panGestureInner,
      {
        backgroundColor: containerColor,
      },
    ];

    const areaStyles = {
      width: areaWidth,
      height: areaHeight,
      backgroundColor: imageBackdropColor,
    };

    const overlayContainerStyle = {
      position: 'absolute' as 'absolute',
      top: 0,
      left: 0,
      height: areaHeight,
      width: areaWidth,
    };

    const imageWrapperStyles = [styles.imageWrapper, areaStyles];

    const imageStyles = [
      styles.image,
      {
        width: imageWidth,
        height: imageHeight,
        transform: [
          {
            scale: this.scale,
          },
          {
            translateX: this.translateX,
          },
          {
            translateY: this.translateY,
          },
        ],
      },
    ];

    return (
      <>
        <Animated.Code>
          {() =>
            block([
              call(
                [this.translateX, this.translateY, this.scale],
                this.handleMove,
              ),
            ])
          }
        </Animated.Code>
        <PanGestureHandler
          ref={this.dragRef}
          simultaneousHandlers={this.pinchRef}
          minPointers={1}
          maxPointers={2}
          avgTouches
          onGestureEvent={this.onPanGestureEvent}
          onHandlerStateChange={this.onPanGestureEvent}
        >
          <Animated.View style={containerStyles}>
            <TapGestureHandler
              numberOfTaps={2}
              onHandlerStateChange={this.onTapGestureEvent}
            >
              <Animated.View style={areaStyles}>
                <PinchGestureHandler
                  ref={this.pinchRef}
                  onGestureEvent={this.onPinchGestureEvent}
                  onHandlerStateChange={this.onPinchGestureEvent}
                >
                  <Animated.View style={imageWrapperStyles} collapsable={false}>
                    <Animated.Image style={imageStyles} source={imageSrc} />
                    {overlay && (
                      <View style={overlayContainerStyle}>{overlay}</View>
                    )}
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </>
    );
  }
}

export default ImageViewer;
