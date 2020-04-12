import React, { PureComponent, RefObject } from 'react';
import { Image, Dimensions } from 'react-native';
import ImageEditor from '@react-native-community/image-editor';
import ImageViewer from './ImageViewer';
import {
  getPercentFromNumber,
  getPercentDiffNumberFromNumber,
} from './helpers/percentCalculator';
import { ICropParams, IImageViewerData, ISizeData } from './types';

interface IProps {
  imageUri: string;
  cropAreaWidth?: number;
  cropAreaHeight?: number;
  setCropperParams: (params: IState) => void;
}

interface IState {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  minScale: number;
  adjustedHeight: number;
  loading: boolean;
  fittedSize: ISizeData;
}

const window = Dimensions.get('window');
const w = window.width;

class ImageCropper extends PureComponent<IProps, IState> {
  static crop = (params: ICropParams) => {
    const {
      imageUri,
      cropSize,
      positionX,
      positionY,
      cropAreaSize,
      srcSize,
      fittedSize,
      scale,
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

    offset.x = offsetW;
    offset.y = offsetH;

    const cropData = {
      offset,
      size: {
        width: sizeW,
        height: sizeH,
      },
      displaySize: {
        width: cropSize.width,
        height: cropSize.height,
      },
    };

    return new Promise((resolve, reject) =>
      ImageEditor.cropImage(imageUri, cropData)
        .then(resolve)
        .catch(reject),
    );
  };

  imageViewer: RefObject<ImageViewer> = React.createRef();

  static defaultProps = {
    cropAreaWidth: w,
    cropAreaHeight: w,
  };

  state = {
    positionX: 0,
    positionY: 0,
    width: 0,
    height: 0,
    minScale: 1,
    adjustedHeight: 0,
    loading: true,
    fittedSize: {
      width: 0,
      height: 0,
    },
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

  init = () => {
    const { imageUri } = this.props;

    Image.getSize(
      imageUri,
      (width, height) => {
        const { setCropperParams, cropAreaWidth, cropAreaHeight } = this.props;

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
          }),
          () => {
            this.imageViewer.current!.reset();
            setCropperParams(this.state);
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
      () => setCropperParams(this.state),
    );
  };

  render() {
    const { loading, fittedSize, minScale } = this.state;
    const { imageUri, cropAreaWidth, cropAreaHeight } = this.props;

    const areaWidth = Math.round(cropAreaWidth!);
    const areaHeight = Math.round(cropAreaHeight!);

    const imageWidth = Math.round(fittedSize.width);
    const imageHeight = Math.round(fittedSize.height);

    return !loading ? (
      <ImageViewer
        ref={this.imageViewer}
        image={imageUri}
        areaWidth={areaWidth}
        areaHeight={areaHeight}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        minScale={minScale}
        onMove={this.handleMove}
      />
    ) : null;
  }
}

export default ImageCropper;
