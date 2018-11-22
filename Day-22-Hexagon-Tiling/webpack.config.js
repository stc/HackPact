const path = require('path');

module.exports = {
	entry: {
		app: './src/index.js',
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: path.resolve(__dirname, '.'),
		publicPath: '/dist/',
		openPage: 'index.html',
		port: 8001,
	},
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist')
	},
	resolve: {
		modules: [path.resolve(__dirname, "node_modules"), "node_modules"]
	}
};
