var webpackConfig = require('../../build/webpack.test.js');

delete webpackConfig.entry;

module.exports = function(config) {
  var configuration = {
    browser: ['Chrome'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec', 'coverage'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      dir: './coverage',
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    },
    client: {
      macha: {
        timeout: 4000
      }
    }
  };

  config.set(configuration);
};

