export interface ISizeData {
  width: number;
  height: number;
}

export interface IImageViewerData {
  positionX: number;
  positionY: number;
  scale: number;
}

export interface ICropParams {
  imageUri: string;
  cropSize: ISizeData;
  positionX: number;
  positionY: number;
  cropAreaSize: ISizeData;
  srcSize: ISizeData;
  fittedSize: ISizeData;
  scale: number;
}
