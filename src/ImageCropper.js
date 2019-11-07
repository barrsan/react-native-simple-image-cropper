import React, { PureComponent } from 'react';
import { Image, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import ImageZoom from 'react-native-image-pan-zoom';
import ImageEditor from '@react-native-community/image-editor';
import { getPercentFromNumber, getPercentDiffNumberFromNumber } from './helpers/percentCalculator';

const window = Dimensions.get('window');
const w = window.width;

class ImageCropper extends PureComponent {
  constructor() {
    super();
    this.imageZoom = React.createRef();
  }

  state = {
    positionX: 0,
    positionY: 0,
    width: 0,
    height: 0,
    minScale: 1.01,
    adjustedHeight: 0,
    loading: true,
  };

  static propTypes = {
    imageUri: PropTypes.string.isRequired,
    setCropperParams: PropTypes.func.isRequired,
    cropAreaWidth: PropTypes.number,
    cropAreaHeight: PropTypes.number,
  };

  static defaultProps = {
    cropAreaWidth: w,
    cropAreaHeight: w,
  };

  static crop = params => {
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

    const percentCropperAreaW = getPercentDiffNumberFromNumber(wScale, fittedSize.w);
    const percentRestW = 100 - percentCropperAreaW;
    const hiddenAreaW = getPercentFromNumber(percentRestW, fittedSize.w);

    const percentCropperAreaH = getPercentDiffNumberFromNumber(hScale, fittedSize.h);
    const percentRestH = 100 - percentCropperAreaH;
    const hiddenAreaH = getPercentFromNumber(percentRestH, fittedSize.h);

    const x = hiddenAreaW / 2 - positionX;
    const y = hiddenAreaH / 2 - positionY;

    offset.x = x <= 0 ? 0 : x;
    offset.y = y <= 0 ? 0 : y;

    const srcPercentCropperAreaW = getPercentDiffNumberFromNumber(offset.x, fittedSize.w);
    const srcPercentCropperAreaH = getPercentDiffNumberFromNumber(offset.y, fittedSize.h);

    const offsetW = getPercentFromNumber(srcPercentCropperAreaW, srcSize.w);
    const offsetH = getPercentFromNumber(srcPercentCropperAreaH, srcSize.h);

    const sizeW = getPercentFromNumber(percentCropperAreaW, srcSize.w);
    const sizeH = getPercentFromNumber(percentCropperAreaH, srcSize.h);

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

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    const { imageUri } = this.props;
    if (imageUri && prevProps.imageUri !== imageUri) {
      this.init();
    }
  }

  init = () => {
    const { imageUri } = this.props;

    Image.getSize(imageUri, (width, height) => {
      const { setCropperParams, cropAreaWidth, cropAreaHeight } = this.props;

      const srcSize = { w: width, h: height };
      const fittedSize = { w: 0, h: 0 };
      let scale = 1.0001;

      if (width > height) {
        const ratio = w / height;
        fittedSize.w = width * ratio;
        fittedSize.h = w;
      } else if (width < height) {
        const ratio = w / width;
        fittedSize.w = w;
        fittedSize.h = height * ratio;
      } else if (width === height) {
        fittedSize.w = w;
        fittedSize.h = w;
      }

      if (cropAreaWidth < cropAreaHeight || cropAreaWidth === cropAreaHeight) {
        if (width < height) {
          if (fittedSize.h < cropAreaHeight) {
            scale = Math.ceil((cropAreaHeight / fittedSize.h) * 10) / 10 + 0.0001;
          } else {
            scale = Math.ceil((cropAreaWidth / fittedSize.w) * 10) / 10 + 0.0001;
          }
        } else {
          scale = Math.ceil((cropAreaHeight / fittedSize.h) * 10) / 10 + 0.0001;
        }
      }

      scale = scale < 1 ? 1.0001 : scale;

      this.setState(
        prevState => ({
          ...prevState,
          srcSize,
          fittedSize,
          minScale: scale,
          loading: false,
        }),
        () => {
          this.imageZoom.current.centerOn({
            x: 0,
            y: 0,
            scale,
            duration: 0,
          });
          setCropperParams(this.state);
        },
      );
    });
  };

  handleMove = ({ positionX, positionY, scale }) => {
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
    const { imageUri, cropAreaWidth, cropAreaHeight, ...restProps } = this.props;
    const imageSrc = { uri: imageUri };

    return !loading ? (
      <ImageZoom
        ref={this.imageZoom}
        {...restProps}
        cropWidth={cropAreaWidth}
        cropHeight={cropAreaHeight}
        imageWidth={fittedSize.w}
        imageHeight={fittedSize.h}
        minScale={minScale}
        onMove={this.handleMove}
      >
        <Image style={{ width: fittedSize.w, height: fittedSize.h }} source={imageSrc} />
      </ImageZoom>
    ) : null;
  }
}

export default ImageCropper;
