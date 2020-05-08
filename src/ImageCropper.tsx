import React, { PureComponent } from 'react';
import { Dimensions, Image, Platform } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import ImageSize from 'react-native-image-size';
import ImageResizer from 'react-native-image-resizer';
// @ts-ignore
import ImageRotate from 'react-native-image-rotate';
import ImageViewer from './ImageViewer';
import {
  getPercentFromNumber,
  getPercentDiffNumberFromNumber,
} from './helpers/percentCalculator';
import {
  ICropperParams,
  ICropParams,
  IImageViewerData,
  ISizeData,
} from './types';

interface IProps {
  imageUri: string;
  cropAreaWidth?: number;
  cropAreaHeight?: number;
  containerColor?: string;
  areaColor?: string;
  setCropperParams: (params: ICropperParams) => void;
}

export interface IState {
  positionX: number;
  positionY: number;
  scale: number;
  minScale: number;
  srcSize: ISizeData;
  fittedSize: ISizeData;
  width: number;
  height: number;
  loading: boolean;
  prevImageUri: string;
  isVerticalImageForAndroidOnly: boolean;
  rotationForAndroidOnly: number;
}

const window = Dimensions.get('window');
const w = window.width;

const defaultProps = {
  cropAreaWidth: w,
  cropAreaHeight: w,
  containerColor: 'black',
  areaColor: 'black',
};

class ImageCropper extends PureComponent<IProps, IState> {
  static crop = (params: ICropParams): Promise<string | null | undefined> => {
    const {
      positionX,
      positionY,
      scale,
      srcSize,
      fittedSize,
      cropSize,
      cropAreaSize,
      imageUri,
      isVerticalImageForAndroidOnly,
      rotationForAndroidOnly,
    } = params;

    const offset = {
      x: 0,
      y: 0,
    };

    const cropAreaW = cropAreaSize ? cropAreaSize.width : w;
    const cropAreaH = cropAreaSize ? cropAreaSize.height : w;

    const wScale = cropAreaW / scale;
    const hScale = cropAreaH / scale;

    const percentCropperAreaW = getPercentDiffNumberFromNumber(
      wScale,
      fittedSize.width,
    );
    const percentRestW = 100 - percentCropperAreaW;
    const hiddenAreaW = getPercentFromNumber(percentRestW, fittedSize.width);

    const percentCropperAreaH = getPercentDiffNumberFromNumber(
      hScale,
      fittedSize.height,
    );
    const percentRestH = 100 - percentCropperAreaH;
    const hiddenAreaH = getPercentFromNumber(percentRestH, fittedSize.height);

    const x = hiddenAreaW / 2 - positionX;
    const y = hiddenAreaH / 2 - positionY;

    offset.x = x <= 0 ? 0 : x;
    offset.y = y <= 0 ? 0 : y;

    const srcPercentCropperAreaW = getPercentDiffNumberFromNumber(
      offset.x,
      fittedSize.width,
    );
    const srcPercentCropperAreaH = getPercentDiffNumberFromNumber(
      offset.y,
      fittedSize.height,
    );

    const offsetW = getPercentFromNumber(srcPercentCropperAreaW, srcSize.width);
    const offsetH = getPercentFromNumber(
      srcPercentCropperAreaH,
      srcSize.height,
    );

    const sizeW = getPercentFromNumber(percentCropperAreaW, srcSize.width);
    const sizeH = getPercentFromNumber(percentCropperAreaH, srcSize.height);

    offset.x = Math.floor(offsetW);
    offset.y = Math.floor(offsetH);

    const cropData = {
      offset,
      size: {
        width: Math.floor(sizeW),
        height: Math.floor(sizeH),
      },
      displaySize: {
        width: Math.round(cropSize.width),
        height: Math.round(cropSize.height),
      },
    };

    if (Platform.OS === 'ios') {
      return new Promise((resolve, reject) =>
        ImageEditor.cropImage(imageUri, cropData)
          .then(resolve)
          .catch(reject),
      );
    }

    if (rotationForAndroidOnly === 0) {
      return new Promise((resolve, reject) => {
        return ImageRotate.rotateImage(
          imageUri,
          isVerticalImageForAndroidOnly ? 90 : 0,
          (urlRotatedImage: string) => {
            return ImageResizer.createResizedImage(
              urlRotatedImage,
              srcSize.width,
              srcSize.height,
              'JPEG',
              100,
              360,
            )
              .then(async res => {
                return ImageEditor.cropImage(res.uri, cropData)
                  .then(resolve)
                  .catch(reject);
              })
              .catch(reject);
          },
          (error: string) => {
            return reject(error);
          },
        );
      });
    }

    // INFO: RC
    return new Promise((resolve, reject) => {
      return ImageResizer.createResizedImage(
        imageUri,
        srcSize.width,
        srcSize.height,
        'JPEG',
        100,
        360,
      )
        .then(async ({ uri }) => {
          return ImageEditor.cropImage(uri, cropData)
            .then(resolve)
            .catch(reject);
        })
        .catch(reject);
    });
  };

  static defaultProps = defaultProps;

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.imageUri !== state.prevImageUri) {
      return {
        prevImageUri: props.imageUri,
        loading: true,
      };
    }

    return null;
  }

  state = {
    positionX: 0,
    positionY: 0,
    width: 0,
    height: 0,
    scale: 1,
    minScale: 1,
    loading: true,
    srcSize: {
      width: 0,
      height: 0,
    },
    fittedSize: {
      width: 0,
      height: 0,
    },
    prevImageUri: '',
    isVerticalImageForAndroidOnly: false,
    rotationForAndroidOnly: 0,
  };

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps: IProps) {
    const { imageUri } = this.props;
    if (imageUri && prevProps.imageUri !== imageUri) {
      this.init();
    }
  }

  init = async () => {
    const {
      imageUri,
      setCropperParams,
      cropAreaWidth,
      cropAreaHeight,
    } = this.props;

    Image.getSize(
      imageUri,
      async (widthSize: number, heightSize: number) => {
        let width = 0;
        let height = 0;
        let isVerticalImageForAndroidOnly = false;
        let rotationForAndroidOnly = 0;

        if (Platform.OS === 'ios') {
          width = widthSize;
          height = heightSize;
        } else {
          const realSize = await ImageSize.getSize(imageUri);

          rotationForAndroidOnly = realSize.rotation!;

          isVerticalImageForAndroidOnly =
            widthSize < heightSize && realSize.width > realSize.height;

          width = isVerticalImageForAndroidOnly
            ? realSize.height
            : realSize.width;
          height = isVerticalImageForAndroidOnly
            ? realSize.width
            : realSize.height;
        }

        const areaWidth = cropAreaWidth!;
        const areaHeight = cropAreaHeight!;
        const srcSize = { width, height };
        const fittedSize = { width: 0, height: 0 };

        let scale = 1;

        if (width > height) {
          const ratio = w / height;
          fittedSize.width = width * ratio;
          fittedSize.height = w;
        } else if (width < height) {
          const ratio = w / width;
          fittedSize.width = w;
          fittedSize.height = height * ratio;
        } else if (width === height) {
          fittedSize.width = w;
          fittedSize.height = w;
        }

        if (areaWidth < areaHeight || areaWidth === areaHeight) {
          if (width < height) {
            if (fittedSize.height < areaHeight) {
              scale = Math.ceil((areaHeight / fittedSize.height) * 10) / 10;
            } else {
              scale = Math.ceil((areaWidth / fittedSize.width) * 10) / 10;
            }
          } else {
            scale = Math.ceil((areaHeight / fittedSize.height) * 10) / 10;
          }
        }

        scale = scale < 1 ? 1 : scale;

        this.setState(
          prevState => ({
            ...prevState,
            srcSize,
            fittedSize,
            minScale: scale,
            loading: false,
            isVerticalImageForAndroidOnly,
            rotationForAndroidOnly,
          }),
          () => {
            const { positionX, positionY } = this.state;

            setCropperParams({
              positionX,
              positionY,
              scale,
              srcSize,
              fittedSize,
              isVerticalImageForAndroidOnly,
              rotationForAndroidOnly,
            });
          },
        );
      },
      () => {},
    );
  };

  handleMove = ({ positionX, positionY, scale }: IImageViewerData) => {
    const { setCropperParams } = this.props;

    this.setState(
      prevState => ({
        ...prevState,
        positionX,
        positionY,
        scale,
      }),
      () => {
        const {
          srcSize,
          fittedSize,
          isVerticalImageForAndroidOnly,
          rotationForAndroidOnly,
        } = this.state;

        setCropperParams({
          positionX,
          positionY,
          scale,
          srcSize,
          fittedSize,
          isVerticalImageForAndroidOnly,
          rotationForAndroidOnly,
        });
      },
    );
  };

  render() {
    const { loading, fittedSize, minScale } = this.state;
    const {
      imageUri,
      cropAreaWidth,
      cropAreaHeight,
      containerColor,
      areaColor,
    } = this.props;

    const areaWidth = cropAreaWidth!;
    const areaHeight = cropAreaHeight!;

    const imageWidth = fittedSize.width;
    const imageHeight = fittedSize.height;

    return !loading ? (
      <ImageViewer
        image={imageUri}
        areaWidth={areaWidth}
        areaHeight={areaHeight}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        minScale={minScale}
        onMove={this.handleMove}
        containerColor={containerColor}
        imageBackdropColor={areaColor}
      />
    ) : null;
  }
}

export default ImageCropper;
