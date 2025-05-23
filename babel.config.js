module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['nativewind/babel', { mode: 'compile' }],
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      }],
      'react-native-reanimated/plugin' // **Bu satır listenin en sonunda olmalı**
    ],
  };
};
