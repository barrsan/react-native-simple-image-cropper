import React, { useState } from 'react';
import {
  StyleSheet,
  StatusBar,
  View,
  Image,
  Button,
  Dimensions,
} from 'react-native';
// eslint-disable-next-line
import ImageCropper from 'react-native-simple-image-cropper';

const window = Dimensions.get('window');
const w = window.width;
const h = window.width;

const IMAGE = 'https://picsum.photos/id/48/900/900';
const IMAGE2 = 'https://picsum.photos/id/215/900/500';

const CROP_AREA_WIDTH = w;
const CROP_AREA_HEIGHT = h;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },

  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  buttonChangeImageWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  previewImageWrapper: {
    position: 'absolute',
    top: 20,
    right: 0,
    borderWidth: 5,
    borderColor: 'white',
    opacity: 0.8,
    zIndex: 3,
  },

  previewImage: {
    width: CROP_AREA_WIDTH / 3,
    height: CROP_AREA_HEIGHT / 3,
  },
});

const App = () => {
  const [imageState, setImageState] = useState(IMAGE);
  const [cropperParamsState, setCropperParamsState] = useState({});
  const [croppedImageState, setCroppedImageState] = useState('');

  const croppedImageSrc = { uri: croppedImageState };

  const handleChangeImagePress = () => {
    const targetImage = imageState === IMAGE ? IMAGE2 : IMAGE;
    setImageState(targetImage);
  };

  const handleCropPress = async () => {
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
        ...cropperParamsState,
        imageUri: imageState,
        cropSize,
        cropAreaSize,
      });

      setCroppedImageState(result);
    } catch (error) {
      // eslint-disable-next-line
      console.log(error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ImageCropper
          imageUri={imageState}
          cropAreaWidth={CROP_AREA_WIDTH}
          cropAreaHeight={CROP_AREA_HEIGHT}
          setCropperParams={setCropperParamsState}
        />
        <View style={styles.buttonWrapper}>
          <Button onPress={handleCropPress} title="Crop Image" color="blue" />
        </View>
        <View style={styles.buttonChangeImageWrapper}>
          <Button
            onPress={handleChangeImagePress}
            title="Change Image"
            color="blue"
          />
        </View>
        {croppedImageState ? (
          <View style={styles.previewImageWrapper}>
            <Image
              resizeMode="cover"
              style={styles.previewImage}
              source={croppedImageSrc}
            />
          </View>
        ) : null}
      </View>
    </>
  );
};

export default App;
