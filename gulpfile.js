'use strict';

var autoprefixer  = require('gulp-autoprefixer'),
    bless         = require('gulp-bless'),
    bower         = require('gulp-bower'), // not used
    cheerio       = require('gulp-cheerio'),
    concat        = require('gulp-concat'),
    connect       = require('gulp-connect'),
    del           = require('del'),
    es            = require('event-stream'), // not used
    ghpages       = require('gulp-gh-pages'),
    gulp          = require('gulp'),
    gulpif        = require('gulp-if'),
    imagemin      = require('gulp-imagemin'),
    insert        = require('gulp-insert'),
    jshint        = require('gulp-jshint'),
    jshintstylish = require('jshint-stylish'),
    less          = require('gulp-less'),
    markdown      = require('gulp-markdown'),
    mustache      = require('gulp-mustache'),
    ngdocs        = require('gulp-ngdocs'),
    ngmin         = require('gulp-ngmin'),
    packagedata   = require('./package.json'),
    plumber       = require('gulp-plumber'),
    rename        = require('gulp-rename'),
    svgSprite     = require('gulp-svg-sprite'),
    templateCache = require('gulp-angular-templatecache'),
    uglify        = require('gulp-uglify'),
    views         = require('./views/views');


var MineralBayVersion = "/*! MineralBay v" + packagedata.version + " */\n";

var Tasks = {
  MineralBayJavascriptVendor:  'Javascript Vendor Libraries',
  MineralBayJavascriptAngular: 'Styleguide Angular Module',
  MineralBayAngularTemplates:  'Styleguide Angular Templates',
  MineralBayJavascript:        'Styleguide Javascript Distributable',

  MineralBayStylesDev:         'Compile Less Files for Development Server',
  MineralBayStylesDist:        'Compile Less Files for Distribution',
  MineralBayStyles:            'Compile Less Files',

  MineralBayCleanSvgIcons:     'cleansvgicons',
  MineralBaySvgIcons:          'svgicons',
  Fonts:					   'fonts',
  
  Languages:				   'languages',


  CreateDocumentationHTML:    'Create Documentation HTML Files',
  AngularApiDocumentation:    'Create Angular API Documentation',

  DevelopmentServer:          'server',
  ReloadDevelopmentJS:        'Reload Development Server Javascript',
  ReloadDevelopmentHTML:      'Reload Development Server HTML',
  ReloadDevelopmentStyles:    'Reload Development Server Styles',
  ReloadDevelopmentSvgIcons:  'Reload Development Server SVG Icons',

  MineralBayClean:             'clean',
  MineralBay:                  'Build Tasks'
};


gulp.task(Tasks.MineralBayJavascriptVendor, function() {
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/jquery-mousewheel/jquery.mousewheel.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/bootstrap-tour/build/js/bootstrap-tour.min.js',
    'bower_components/bootstrap-select/js/bootstrap-select.js',
    'js/bootstrap-datepicker-custom.js',
    'js/bootstrap-datepicker-override.js',
    'vendor/chosen/chosen.jquery.min.js',
    'bower_components/baron/baron.min.js',
    'bower_components/momentjs/min/moment.min.js',
    'js/global.js',
    'js/mineralbay-navlinks.js',
    'js/mineralbay-svgloader.js',
    'js/vendor-config.js',
    'js/rainbow.js',
    'js/generic.js',
    'js/javascript.js',
    'js/html.js',
    'bower_components/angular/angular.js',// No minified version
    'bower_components/angular/angular-animate.min.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'bower_components/angular-ui-select/dist/select.js', 
    'bower_components/angular-moment/angular-moment.min.js',
    'bower_components/angular-sanitize/angular-sanitize.min.js',
    'bower_components/angular-route/angular-route.min.js',
    'bower_components/boomsvgloader/dist/js/boomsvgloader.min.js',
    'bower_components/ng-table/dist/ng-table.min.js',
    'bower_components/angular-strap/dist/angular-strap.min.js',
    'bower_components/angular-strap/dist/angular-strap.tpl.min.js'
  ])
  .pipe(concat('mineralbay.js'))
  .pipe(insert.prepend(MineralBayVersion))
  .pipe(insert.append(';'))
  .pipe(gulp.dest('docs/js/'))
  .pipe(gulp.dest('dist/js/'))
  .pipe(rename({ suffix:'.min' }))
  .pipe(uglify({ mangle: false, outSourceMap: true }))
  .pipe(gulp.dest('docs/js/'))
  .pipe(gulp.dest('dist/js/'));
});

gulp.task(Tasks.MineralBayJavascriptAngular, function() {
  return gulp.src(['app/app.js', 'app/constants.js', 'app/scripts/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintstylish))
    .pipe(ngmin())
    .pipe(concat('mineralbay-angular.js'))
    .pipe(insert.append(';'))
    .pipe(gulp.dest('docs/js/'));
});

gulp.task(Tasks.MineralBayAngularTemplates, function() {
  return es.concat(
    gulp.src(['app/template/**/*.html', '!app/template/pagination/*.html'])
      .pipe(templateCache({
        module: 'mineralbay',
        root: 'template'
      })),
    gulp.src('app/template/bootstrap/**/*.html')
      .pipe(templateCache({
        module: 'ui.bootstrap',
        root: 'template/'
      }))
  )
  .pipe(concat('mineralbay-angular-templates.js'))
  .pipe(gulp.dest('docs/js/'));
});

gulp.task(Tasks.MineralBayJavascript,
  [
    Tasks.MineralBayJavascriptVendor,
    Tasks.MineralBayJavascriptAngular,
    Tasks.MineralBayAngularTemplates
  ], function() {
  // Combine templates and angular
  return gulp.src(['docs/js/mineralbay-angular.js', 'docs/js/mineralbay-angular-templates.js'])
    .pipe(concat('mineralbay-angular.js'))
    .pipe(insert.prepend(MineralBayVersion))
    .pipe(gulp.dest('docs/js/'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename({ suffix:'.min' }))
    .pipe(uglify({ mangle: false, outSourceMap: true }))
    .pipe(gulp.dest('docs/js/'))
    .pipe(gulp.dest('dist/js/'));
});


/*
 * Create html files
 */
gulp.task(Tasks.CreateDocumentationHTML, function() {
  return es.concat.apply(es,
    Object.keys(views).map(function(key) {
      var sources = [],
        idLinks = [],
        src = views[key];

      // Retrieve the ids and Headers
      // for each item we are concatenating
      src.sources.forEach(function(view) {
        if (view.css_id){
          idLinks.push({
            css_id: view.css_id,
            nav_header: view.nav_header
          });
        }

        sources.push(view.source);
      });

      var sourceFiles = ['views/partials/header.html'];
      sourceFiles.push.apply(sourceFiles, sources);
      sourceFiles.push.apply(sourceFiles, [
        'views/partials/sub_nav.tpl.html',
        'views/partials/footer.html'
      ]);

      return gulp.src(sourceFiles)
        .pipe(
          gulpif(
            /(header|sub_nav\.tpl)\.html/,
            mustache({
              page_title: src.header,
              header:     src.header,
              link:       idLinks
            })
          )
        )
        .pipe(concat(key + '.html'));
    })
  ).pipe(gulp.dest('docs/'));
});

/*
 * Create angular api documentation
 */
gulp.task(Tasks.AngularApiDocumentation, function() {
  var options = {
    scripts: [
      'docs/js/mineralbay.js',
      'docs/js/mineralbay-angular.js',
      'bower_components/angular-animate/angular-animate.min.js'
    ],
    styles: [
      '//fonts.googleapis.com/css?family=Roboto:500,300,700,400italic,400',
      'docs/css/mineralbay.css'
    ],
    loadDefaults: {
      angular: false,
      angularAnimate: false
    },
    html5Mode: false,
    startPage: '/ngMineralBay',
    title: '',
    image: 'docs/images/mineralbay-logo.png',
    imageLink: '/index.html',
    navTemplate: 'views/partials/ngdocs-nav.html',
    titleLink: '/index.html'
  }
  return ngdocs.sections({
    ngMineralBay: {
      glob:['docs/js/mineralbay-angular.js'],
      title: 'angular api'
    }
  }).pipe(ngdocs.process(options)).pipe(gulp.dest('docs/angularapi'));
});


gulp.task(Tasks.ReloadDevelopmentJS, function() {
 gulp.src('docs/js/*.js')
 .pipe(connect.reload());
});

gulp.task(Tasks.ReloadDevelopmentStyles, function() {
  gulp.src('docs/css/**/*.css')
  .pipe(connect.reload());
});

gulp.task(Tasks.ReloadDevelopmentSvgIcons, function() {
  gulp.src('docs/svg/**/*.svg')
  .pipe(connect.reload());
});

/*
 * Dynamically reload connect website when html changes
 */
gulp.task(Tasks.ReloadDevelopmentHTML, function() {
  gulp.src('docs/**/*.html')
    .pipe(connect.reload());
});

gulp.task(Tasks.MineralBayStylesDev, function() {
  var DEST_DIR  = 'docs/css';
  var DEST_FILE = 'mineralbay.css';

  return gulp.src([
    'less/mineralbay.less',
    'less/mineralbay-docs.less'
  ])
    .pipe(plumber())
    .pipe(concat(DEST_FILE))
    .pipe(less({ compress: false }))
    .pipe(plumber.stop())
    .pipe(autoprefixer({ browsers: ['last 2 versions','ie 10'], cascade: false }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe(bless({ imports: false }))
    .pipe(gulp.dest('docs/css/splitcss/'));
});

gulp.task(Tasks.MineralBayStylesDist, function() {
  var DEST_DIR  = 'dist/css';
  return gulp.src([
    'less/mineralbay.less'
  ])
    .pipe(less({ compress: false })) // Do not compress. It screw up importing as 'less' in other projects.
    .pipe(autoprefixer({ browsers: ['last 2 versions','ie 10'], cascade: false }))
    .pipe(insert.prepend(MineralBayVersion))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task(Tasks.MineralBayStyles, [Tasks.MineralBayStylesDev, Tasks.MineralBayStylesDist]);

/*
* SVG build tasks
*/
gulp.task(Tasks.MineralBaySvgIcons, function () {
  return gulp.src('svg/**/*.svg')
    .pipe(imagemin())
    .pipe(gulp.dest('docs/svg'))
    .pipe(gulp.dest('dist/svg'))
    .pipe(svgSprite({
        'shape': {
          'id': {
            'generator': 'icon-'
          }
        },
        'mode': {
          'symbol': {
            'dest': '',
            'example': true,
            'sprite': 'sprite.svg'
          }
        },
        'svg': {
          'xmlDeclaration': false,
          'doctypeDeclaration': false,
          'dimensionAttributes': false
        }
      }))
    .pipe(gulp.dest('docs/svg'))
    .pipe(gulp.dest('dist/svg'));
});

gulp.task(Tasks.MineralBayCleanSvgIcons, function () {
  del([
    'docs/svg/',
    'dist/svg/'
  ]);
});


/*
* Common build task run by all tasks
*/
gulp.task(Tasks.MineralBay, [Tasks.MineralBayStyles, Tasks.MineralBaySvgIcons, Tasks.Fonts, Tasks.Languages, Tasks.MineralBayJavascript, Tasks.CreateDocumentationHTML, Tasks.AngularApiDocumentation], function() {
  var IMAGES_DIR   = 'docs/images',
  FONTS_DOCS_DIR = 'docs/css/fonts',
  FONTS_DIST_DIR = 'dist/css/fonts';

  // Copy all image/font files if they are newer than destination
  return es.concat(
    gulp.src('images/**/*.*')
    .pipe(gulp.dest(IMAGES_DIR)),
    gulp.src('fonts/**/*.*')
    .pipe(gulp.dest(FONTS_DOCS_DIR)),
    gulp.src('fonts/**/*.*')
    .pipe(gulp.dest(FONTS_DIST_DIR))
  );
});


/*gulp.task('clean', function() {
  return gulp.src(['docs/', 'dist/'], { read: false })
    .pipe(clean());
});*/

gulp.task(Tasks.MineralBayClean, function () {
  del([
    'docs/',
    'dist/'
  ]);
});


gulp.task(Tasks.Fonts, function(){
	return gulp.src('bower_components/bootstrap/fonts/*')
		    .pipe(imagemin())
		    .pipe(gulp.dest('docs/fonts'))
		    .pipe(gulp.dest('dist/fonts'));
});

gulp.task(Tasks.Languages, function(){
	return gulp.src('bower_components/bootstrap-languages/languages.png')
		    .pipe(imagemin())
		    .pipe(gulp.dest('docs/css'))
});

gulp.task('bower', function() {
  return bower();
});


// Run a server with a watch with gulp server
gulp.task(Tasks.DevelopmentServer, [Tasks.MineralBay], function() {
  // gulp.run('grunt-tasks-ngdocs');
  // gulp.run('angularAPI');
  connect.server({
    hostname: 'localhost',
    port: 9000,
    root: 'docs',
    keepalive: false,
    livereload: true
  });

  // Watch Less files
  gulp.watch(['less/**/*.less'], [Tasks.MineralBayStylesDev, Tasks.ReloadDevelopmentStyles]);

  // Watch SVG Icon files
  gulp.watch(['svg/**/*.svg'], [Tasks.MineralBaySvgIcons, Tasks.ReloadDevelopmentSvgIcons]);

  // Watch Javascript Files and Templates
  gulp.watch([
    'bower_components/**/*.js',
    'js/**/*.js',
    'app/**/*.js',
    'app/template/**/*.html'
  ], [Tasks.MineralBayJavascript, Tasks.ReloadDevelopmentJS]);

  // Watch html files
  gulp.watch(
    ['app/views/*.html', 'views/**/*.html'],
    [Tasks.CreateDocumentationHTML, Tasks.ReloadDevelopmentHTML]
  );
});

/*
 * +==============+
 * =              =
 * = Public Tasks =
 * =              =
 * +==============+
 */
// Just run compilation by default
gulp.task('default', [Tasks.MineralBay]);
