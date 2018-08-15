var path = require('path');
var webpackConfig = require('../../build/webpack.test.js');

delete webpackConfig.entry;

module.exports = function(config) {
  var configuration = {
    browser: ['Chrome'],
    frameworks: ['mocha', 'sinon-chai'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    reporters: ['progress'],
    reports: ['html', 'text-summary'],
    coverageIstanbulReporter: {
      reports: [ 'text-summary' ],
      fixWebpackSourcePaths: true,
      'report-config': {
        html: {
          subdir: 'html'
        }
      },
      dir: path.join(__dirname, 'coverage')
    },
    client: {
      macha: {
        timeout: 4000
      }
    }
  };

  config.set(configuration);
};

