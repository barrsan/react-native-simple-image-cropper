/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState} from 'react';
import {SafeAreaView, Text, Image, Dimensions, Button} from 'react-native';

import ImageZoom from 'react-native-image-pan-zoom';
import ImageEditor from '@react-native-community/image-editor';
const {width} = Dimensions.get('window');
const height = 400; // custom image previewer height

const imageWidth = 800;
const imageHeight = 500;
const img = `https://source.unsplash.com/2Ts5HnA67k8/${imageWidth}x${imageHeight}`;

const App = () => {
  let ratio = imageWidth / width;
  let reqWidth = width;
  let reqHeight = imageHeight / ratio;

  if (imageHeight > imageWidth) {
    ratio = imageHeight / height;
    reqWidth = imageWidth / ratio;
    reqHeight = height;
  }

  const [croppedImage, setCroppedImage] = useState();
  const imageRef = useRef() || {};
  const cropParamsGenerator = (centerPosX, centerPosY, scale) => {
    // console.log({centerPosX, centerPosY, scale});

    let posX = (reqWidth * scale - reqWidth) / 2 + centerPosX * -scale;
    let posY = (reqHeight * scale - reqHeight) / 2 + centerPosY * -scale;

    let additionWidth = width - reqWidth;
    let additionHeight = height - reqHeight;

    console.log(
      `posX = ${posX} | posY = ${posY} | ratio=${ratio} | scale =${scale} | width=${width} | height=${reqHeight}`,
    );

    let finalX = (posX / scale) * ratio - (additionWidth / 2 / scale) * ratio;
    let finalY = (posY / scale) * ratio - (additionHeight / 2 / scale) * ratio;
    let finalWidth =
      (reqWidth / scale) * ratio + (additionWidth / scale) * ratio;
    let finalHeight =
      (reqHeight / scale) * ratio + (additionHeight / scale) * ratio;

    if (finalX < 0) {
      finalX = 0;
    }
    if (finalY < 0) {
      finalY = 0;
    }

    if (finalWidth > reqWidth * ratio) {
      finalWidth = reqWidth * ratio;
    }

    if (finalHeight > reqHeight * ratio) {
      finalHeight = reqHeight * ratio;
    }

    return {
      offset: {
        x: finalX,
        y: finalY,
      },
      size: {
        width: finalWidth,
        height: finalHeight,
      },
    };
  };

  const pressHandler = async () => {
    let params = cropParamsGenerator(
      imageRef.current.positionX,
      imageRef.current.positionY,
      imageRef.current.scale,
    );
    let result = await ImageEditor.cropImage(img, params);
    setCroppedImage(result);
  };

  console.log({reqHeight, reqWidth, ratio});

  return (
    <SafeAreaView>
      <ImageZoom
        cropWidth={width}
        cropHeight={height}
        imageWidth={reqWidth}
        imageHeight={reqHeight}
        ref={imageRef}>
        <Image
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: reqWidth,
            height: reqHeight,
            backgroundColor: 'green',
          }}
          resizeMode="contain"
          source={{uri: img}}
        />
      </ImageZoom>
      <Button title="Crop" onPress={pressHandler} color="red" />
      <Image
        source={{uri: croppedImage}}
        resizeMode="contain"
        style={{
          height: 300,
          width,
          backgroundColor: 'red',
        }}
      />
    </SafeAreaView>
  );
};

export default App;
