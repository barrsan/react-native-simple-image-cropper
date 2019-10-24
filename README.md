# react-native-simple-image-cropper

## Show Case


<img src="https://raw.githubusercontent.com/barrsan/react-native-simple-image-cropper/master/showcase.gif" alt="showcase" width="89%">  |  <img src="https://raw.githubusercontent.com/barrsan/react-native-simple-image-cropper/master/showcase2.gif" alt="showcase" width="96%"> |
:---------------:|:----------------:|

---

**[DEMO](https://snack.expo.io/@barrsan/react-native-simple-image-cropper-demo)**

---

## Getting Started

### Installation

```bash
npm i react-native-simple-image-cropper --save
```

or

```bash
yarn add react-native-simple-image-cropper
```

### Usage

```javascript
import React from 'react';
import { Dimensions, StyleSheet, View, Image, Button } from 'react-native';
import ImageCropper from 'react-native-simple-image-cropper';

const window = Dimensions.get('window');
const w = window.width;

const IMAGE = 'https://picsum.photos/id/48/900/500';

const CROP_AREA_WIDTH = w;
const CROP_AREA_HEIGHT = w;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },

  imagePreview: {
    width: 100,
    height: 100,
  },
});

class App extends React.Component {	
  state = {
    cropperParams: {},
    croppedImage: '',
  };

  setCropperParams = cropperParams => {
    this.setState(prevState => ({
      ...prevState,
      cropperParams,
    }));
  };
  
  handlePress = async () => {
    const { cropperParams } = this.state;

    const cropSize = {
      width: 200,
      height: 200,
    };

    const cropAreaSize = {
      width: CROP_AREA_WIDTH,
      height: CROP_AREA_HEIGHT,
    };

    try {
      const result = await ImageCropper.crop({
        ...cropperParams,
        imageUri: IMAGE,
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
    const { croppedImage } = this.state;
    const src = { uri: croppedImage };
    
    return (
      <View style={styles.container}>
        <ImageCropper
          imageUri={IMAGE}
          cropAreaWidth={CROP_AREA_WIDTH}
          cropAreaHeight={CROP_AREA_HEIGHT}
          setCropperParams={this.setCropperParams}
        />
        <Button onPress={this.handlePress} title="Crop Image" color="blue" />
        {croppedImage ? (
          <Image style={styles.imagePreview} source={src} />
        ) : null}
      </View>
    );
  }
}
```

## Credits

Based from [react-native-image-zoom](https://github.com/ascoders/react-native-image-zoom).

## License

MIT
