export interface ISizeData {
  width: number;
  height: number;
}

export interface IImageViewerData {
  positionX: number;
  positionY: number;
  scale: number;
}

export interface ICropperParams {
  positionX: number;
  positionY: number;
  scale: number;
  srcSize: ISizeData;
  fittedSize: ISizeData;
  cropArea?: IConstraints;
}

export interface ICropParams extends ICropperParams {
  cropSize: ISizeData;
  cropAreaSize: ISizeData;
  imageUri: string;
}

export interface IConstraints {
  offset: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}
