var webpack = require('webpack'),
    path = require('path'),
    yargs = require('yargs');

var libraryName = 'MyLib',
    plugins = [],
    outputFile;

if (yargs.argv.p) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

plugins.push(
    new TemplatePlugin('index.d.ts.tpl', libraryName + '.d.ts'),
    new SkipAssets(new RegExp('^(?!' + libraryName + ')'))
);

var config = {
  context: path.join(__dirname, 'src'),
  entry: './TestClass.ts',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    preLoaders: [
      { test: /\.tsx?$/, loader: 'tslint', exclude: /node_modules/ }
    ],
    loaders: [
      { test: /\.tsx?$/, loader: 'ts', exclude: /node_modules/ }
    ]
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: [ '', '.js', '.ts', '.jsx', '.tsx' ]
  },
  plugins: plugins,

  // Individual Plugin Options
  tslint: {
    emitErrors: true,
    failOnHint: true
  }
};

module.exports = config;

/**
 * Webpack plugin to remove unnecessary assets
 * @param {RegExp} assetsRegex regular expression that matches unnecessary assets
 * @constructor
 */
function SkipAssets(assetsRegex) {
    this.apply = function(compiler) {
        compiler.plugin('emit', function(compilation, callback) {
            Object.keys(compilation.assets).forEach(function(name) {
                if (name.match(assetsRegex)) {
                    delete compilation.assets[name];
                }
            });
            callback();
        });
    }
}

/**
 * Webpack plugin to create an asset from a template file *.tpl
 * @param {string} [inFilename] template filename, `outFilename` by default
 * @param {string} outFilename output filename
 * @constructor
 */
function TemplatePlugin(inFilename, outFilename) {
    if (!outFilename) {
        outFilename = inFilename;
        inFilename = inFilename + '.tpl';
    }
    var tmpl = require('blueimp-tmpl');
    var fs = require('fs');

    this.apply = function(compiler) {
        compiler.plugin('emit', function(compilation, callback) {
            var tplFilename = path.join(compiler.context, inFilename);
            fs.readFile(tplFilename, 'utf8', function(err, data) {
                if (err) {
                    return callback(err);
                }
                var source = tmpl(data, {
                    compiler: compiler,
                    compilation: compilation
                });
                compilation.assets[outFilename] = {
                    source: function() {
                        return source;
                    },
                    size: function() {
                        return source.length;
                    }
                };
                callback();
            });
        });
    };
}
