import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// eslint-disable-next-line
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
