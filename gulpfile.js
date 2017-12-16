'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');//帮助自动加载package.json文件里的gulp插件
var browserSync = require('browser-sync');//实时快速响应文件更改
var wiredep = require('wiredep').stream;

var $ = gulpLoadPlugins();
var reload = browserSync.reload;


/*
	版本控制
 */
var pkg = require('./package.json');
var config = {
	base:'app',
	dist:'dist/'+pkg.version,
	// proxyUrl:'http://10.118.242.150:8091'
	
	// proxyUrl:'http://10.118.200.109:8080' 
	proxyUrl:'https://cpay-sit.sf-pay.com/'
	// proxyUrl:'http://10.118.220.88:9084'
	//proxyUrl:'http://10.118.192.215:8080'
	//proxyUrl:'http://10.118.213.60:9098'
};
// 语法检查
// gulp.task('jshint', function() {
// 	gulp.src('app/**/*.js')
// 		.pipe(jshint())
// 		.pipe(jshint.reporter('default'));
// });
//编译sass
gulp.task('sass',function(){
	return gulp.src('app/scss/app.scss')
	    .pipe($.plumber())//gulp-plumber错误管理
	    .pipe($.sourcemaps.init())//当scss有各种引入关系时，编译后不容易找到对应scss文件，所以需要生成sourcemap文件，方便修改
	    .pipe($.sass.sync({
	      outputStyle: 'expanded',
	      precision: 10,
	      includePaths: ['.']
	    }).on('error', $.sass.logError))
	    .pipe($.sourcemaps.write())
	    .pipe(gulp.dest('app/styles'))
	    .pipe(reload({stream: true}));
});


function lint(files, options) {
  return function() {
    return gulp.src(files)
      .pipe(reload({stream: true, once: true}))
      .pipe($.eslint(options))
      .pipe($.eslint.format())
      .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
  };
}
var testLintOptions = {
  env: {
    mocha: true
  }
};
gulp.task('lint', lint('app/**/*.js'));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));


gulp.task('home',function(){
	var assets = $.useref({searchPath: ['.tmp', 'app', '.']});
	return gulp.src('app/*.html')
	    .pipe(assets)
	    // .pipe($.if('*.js', $.ngAnnotate()))
	    .pipe($.if('*.js', $.uglify({
			mangle: false,//类型：Boolean 默认：true 是否修改变量名
			compress: {
				drop_console: true // <-
			}//类型：Boolean 默认：true 是否完全压缩
        })))
	    .pipe($.if('*.css', $.minifyCss({compatibility: '*'})))
	    //.pipe(assets.restore()) // V2.0版本写法，V3.0不支持
	    .pipe($.useref())
	    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
	    .pipe(gulp.dest(config.dist));
});
gulp.task('jsmin', ['copy'], function () {
	gulp.src(['app/**/*.js', '!app/scripts/**/*.js', '!app/routes.js'])
		.pipe($.uglify({
			mangle: false,//类型：Boolean 默认：true 是否修改变量名
			// compress: true,
			//
			// mangle: {
			// 	//排除混淆关键字
			// 	except: [
			// 	'require' ,
			// 	'exports' ,
			// 	'module' ,
			// 	'$',
			// 	'app',
			// 	'define',
			// 	'directive',
			// 	'CryptoJS',
			// 	'angular',
			// 	'filter',
			// 	'controller'
			// ]},

			compress: {
				drop_console: true // <-
			}//类型：Boolean 默认：true 是否完全压缩
			// preserveComments: all //保留所有注释
		}))
		.pipe(gulp.dest(config.dist));
});

gulp.task('copy',  function() {
	return gulp.src('app/routes.js')
		.pipe(gulp.dest(config.dist));
});

gulp.task('html',function(){
	return gulp.src(['app/**/*.html','!app/*.html'])
    .pipe($.minifyHtml({conditionals:true,loose:true}))
    .pipe(gulp.dest(config.dist))
    .pipe(reload({stream: true}));
});

gulp.task('images',function(){
	return gulp.src('app/images/**/*')
    .pipe($.if($.if.isFile, $.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{cleanupIDs: false}]
    }))
    .on('error', function (err) {
      console.log(err);
      this.end();
    })))
    .pipe(gulp.dest(config.dist+'/images'));
});

gulp.task('fonts',function(){
	return gulp.src(require('main-bower-files')({
			filter: '**/*.{eot,svg,ttf,woff,woff2}'
		}).concat('bower_components/ionic/release/fonts/**/*'))
	    .pipe(gulp.dest('app/fonts'))
	    .pipe(gulp.dest(config.dist+'/fonts'));
});


gulp.task('wiredep',function(){
	gulp.src('app/scss/*.scss')
        .pipe(wiredep({
        	directory: './bower_components/',
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest('app/scss'));

    gulp.src('app/*.{html,htm}')
        .pipe(wiredep({
            directory: './bower_components/',
            //exclude: ['ionic'],
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});




var proxyMiddleware = require('http-proxy-middleware');
var proxy = proxyMiddleware('/h5-wallet-nirvana', {target: config.proxyUrl,changeOrigin: true});

gulp.task('serve',['sass','lint'],function(){
	browserSync({
	    notify: false,
	    port: 9010,
	    server: {
			baseDir: ['app'],
			routes: {
				'/bower_components': 'bower_components'
			}
	    },
	    middleware: [proxy]
	});

	gulp.watch([
	    'app/**/*.html',
	    'app/scripts/**/*.js',
	    'app/components/**/*.js',
	    'app/images/**/*',
	    'app/fonts/**/*',
	    'app/styles/**/*'
	]).on('change', reload);
    
	gulp.watch(['app/scss/**/*.scss','app/components/**/*.scss'], ['sass']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	//gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist',function(){
	browserSync({
	    notify: false,
	    port: 9011,
	    server: {
			baseDir: [config.dist]
	    }
	});

	gulp.watch([
	    config.dist+'/**/*.html',
	    config.dist+'/scripts/**/*.js',
	    config.dist+'/images/**/*',
	    config.dist+'/fonts/**/*',
	    config.dist+'/styles/**/*'
	]).on('change', reload());
});

gulp.task('build:production', function() {
  return gulp.src(config.dist+'/**/*').pipe($.size({title: 'build', gzip: true}));
});
// gulp.task('build',$.sequence('lint',['images','fonts','html','jsmin','home'],'build:production'));
gulp.task('build',$.sequence('lint',['images','fonts','html','home'],'build:production'));

gulp.task('default', ['clean'],function(){
	gulp.start('serve');
});


