module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel', { mode: 'compile' }],
      ['module:react-native-dotenv'],
      'react-native-reanimated/plugin' // **Bu satır listenin en sonunda olmalı**
    ],
  };
};
