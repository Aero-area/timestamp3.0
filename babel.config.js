module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@app': './app',
            '@components': './components',
            '@lib': './lib',
            '@providers': './providers',
            '@types': './types',
            '@utils': './utils',
            '@assets': './assets',
            '@constants': './constants',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
      'expo-router/babel',
      // keep this LAST
      'react-native-reanimated/plugin',
    ],
  };
};