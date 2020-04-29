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
}

export interface ICropParams extends ICropperParams {
  cropSize: ISizeData;
  cropAreaSize: ISizeData;
  imageUri: string;
}
