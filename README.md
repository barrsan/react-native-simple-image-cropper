# react-native-simple-image-cropper

Simple react-native component for image cropping.

## Show Case

<img src="https://raw.githubusercontent.com/barrsan/react-native-simple-image-cropper/master/showcase.gif" alt="showcase" width="89%">  |  <img src="https://raw.githubusercontent.com/barrsan/react-native-simple-image-cropper/master/showcase2.gif" alt="showcase" width="96%"> |
:---------------:|:----------------:|


**[DEMO 1](https://snack.expo.io/@barrsan/react-native-simple-image-cropper-demo)**

**[DEMO 2](https://snack.expo.io/@barrsan/react-native-simple-image-cropper-demo-v1.1.2)**

---

## Installation

```bash
npm i react-native-simple-image-cropper --save
```

or

```bash
yarn add react-native-simple-image-cropper
```

## Installing dependencies

```bash
npm i react-native-reanimated react-native-gesture-handler @react-native-community/image-editor --save
```

or

```bash
yarn add react-native-reanimated react-native-gesture-handler @react-native-community/image-editor
```

Libraries installation details: [@react-native-community/image-editor](https://github.com/react-native-community/react-native-image-editor), [react-native-gesture-handler](https://software-mansion.github.io/react-native-gesture-handler/docs/getting-started.html), [react-native-reanimated](https://software-mansion.github.io/react-native-reanimated/getting-started.html).

---

## Usage

```javascript
import React from 'react';
import { Dimensions, View, Image, Button } from 'react-native';
import ImageCropper from 'react-native-simple-image-cropper';

const window = Dimensions.get('window');
const w = window.width;

const IMAGE = 'https://picsum.photos/id/48/900/500';

const CROP_AREA_WIDTH = w;
const CROP_AREA_HEIGHT = w;

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
      <View>
        <ImageCropper
          imageUri={IMAGE}
          cropAreaWidth={CROP_AREA_WIDTH}
          cropAreaHeight={CROP_AREA_HEIGHT}
          containerColor="black"
          areaColor="black"
          setCropperParams={this.setCropperParams}
        />
        <Button onPress={this.handlePress} title="Crop Image" color="blue" />
        {croppedImage ? (
          <Image source={src} />
        ) : null}
      </View>
    );
  }
}
```

## Area overlay

To add a custom overlay, use the `areaOverlay` property

```javascript

<ImageCropper
  ...
  areaOverlay={<Image src={require('./overlay.png')}>}
/>

```

## License

MIT

## Thanks for contribution

- [alexstrat](https://github.com/alexstrat)
- [rederteph](https://github.com/rederteph)
- [3GOMESz](https://github.com/3GOMESz)
