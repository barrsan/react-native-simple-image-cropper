# react-native-simple-image-cropper

## Show Case

<img src="https://raw.githubusercontent.com/barrsan/react-native-simple-image-cropper/master/showcase.gif" alt="showcase" width="30%">

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
import { View, Image, Button, StyleSheet } from 'react-native';
import ImageCropper from 'react-native-simple-image-cropper';

const IMAGE = 'https://picsum.photos/900/500';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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

    try {
      const result = await ImageCropper.crop({
        ...cropperParams,
        imageUri: IMAGE,
        cropSize,
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
    
    return (
      <View style={styles.container}>
        <ImageCropper imageUri={IMAGE} setCropperParams={this.setCropperParams} />
        <Button onPress={this.handleCropPress} title="Crop Image" color="blue" />
        {croppedImage ? (
          <Image style={{ width: 100, height: 100 }} source={{ uri: croppedImage }} />
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
