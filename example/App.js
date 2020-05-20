import React from 'react';
import { View, Image, Button, StyleSheet, Dimensions } from 'react-native';
import ImageCropper from 'react-native-simple-image-cropper'; // eslint-disable-line

import overlayPng from './overlay.png';

const window = Dimensions.get('window');
const w = window.width;
const h = window.width;
// const h = window.height;

// const IMAGE = 'https://picsum.photos/id/48/500/900';
const IMAGE = 'https://picsum.photos/id/48/900/900';
const IMAGE2 = 'https://picsum.photos/id/215/900/500';
const TARGET = 'https://i.imgur.com/WWcQlwR.png';

const CROP_AREA_WIDTH = w;
const CROP_AREA_HEIGHT = h;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  buttonChangeImageContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  imagePreviewContainer: {
    position: 'absolute',
    top: 20,
    right: 0,
    borderWidth: 5,
    borderColor: 'white',
    opacity: 0.8,
    zIndex: 3,
  },

  imagePreview: {
    width: CROP_AREA_WIDTH / 3,
    height: CROP_AREA_HEIGHT / 3,
  },
});

class App extends React.Component {
  state = {
    image: TARGET,
    cropperParams: {},
    croppedImage: '',
  };

  setCropperParams = cropperParams => {
    this.setState(prevState => ({
      ...prevState,
      cropperParams,
    }));
  };

  handleChangeImagePress = () => {
    this.setState(prevState => ({
      ...prevState,
      image: prevState.image === IMAGE ? IMAGE2 : IMAGE,
    }));
  };

  handlePress = async () => {
    const { image } = this.state;
    const { cropperParams } = this.state;
    const cropSize = {
      width: CROP_AREA_WIDTH / 2,
      height: CROP_AREA_HEIGHT / 2,
    };

    const cropAreaSize = {
      width: CROP_AREA_WIDTH,
      height: CROP_AREA_HEIGHT,
    };

    try {
      const result = await ImageCropper.crop({
        ...cropperParams,
        imageUri: image,
        cropSize,
        cropAreaSize,
      });
      this.setState(prevState => ({
        ...prevState,
        croppedImage: result,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { croppedImage, image } = this.state;
    const src = { uri: croppedImage };

    const Overlay = (
      <Image
        style={{
          height: CROP_AREA_HEIGHT,
          width: CROP_AREA_WIDTH,
        }}
        source={overlayPng}
        resizeMode="contain"
      />
    );

    return (
      <View style={styles.container}>
        <ImageCropper
          imageUri={image}
          cropAreaWidth={CROP_AREA_WIDTH}
          cropAreaHeight={CROP_AREA_HEIGHT}
          setCropperParams={this.setCropperParams}
          areaOverlay={Overlay}
          cropArea={{
            offset: {
              x: 0.125 * CROP_AREA_WIDTH,
              y: 0.125 * CROP_AREA_HEIGHT,
            },
            size: {
              width: 0.75 * CROP_AREA_WIDTH,
              height: 0.75 * CROP_AREA_HEIGHT,
            },
          }}
        />
        <View style={styles.buttonContainer}>
          <Button onPress={this.handlePress} title="Crop Image" color="blue" />
        </View>
        <View style={styles.buttonChangeImageContainer}>
          <Button
            onPress={this.handleChangeImagePress}
            title="Change Image"
            color="blue"
          />
        </View>
        {croppedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              resizeMode="cover"
              style={styles.imagePreview}
              source={src}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

export default App;
