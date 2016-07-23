# gulp-custom-css-urls

[![Build Status via Travis CI](https://travis-ci.org/navyxie/gulp-custom-css-urls.svg?branch=master)](https://travis-ci.org/navyxie/gulp-custom-css-urls) [![Coverage Status](https://coveralls.io/repos/github/navyxie/gulp-custom-css-urls/badge.svg?branch=master)](https://coveralls.io/github/navyxie/gulp-custom-css-urls?branch=master)

a plugin for gulp to custom you image url inline css file, and support output image file, then you can upload image file to Cloud CDN.

## usage

```js
var customCssUrls = require('gulp-custom-css-urls');
var gulp = require('gulp');
var path = require('path');
gulp.task('demo',function(){
  return gulp.src('assets/**/*.css')
    .pipe(customCssUrls({
      /** 
       * static filepath relative absolute filepath's physical position. 
       * eg: 
       * image path inline css is '/images/demo.png', 
       * image absoulte filepath is '/Users/Navy/Desktop/code/demo/assets/images/demo.png', 
       * the process(process.cwd()) path is '/Users/Navy/Desktop/code/demo', 
       * so the image path relative website root path is 'assets/'
      */
      staticfile_relative_website_rootpath: 'assets/', 
      outputImage: true, // output images file , default to false
      outputImage_path: './.gulp_dist_output_images', // default to './.gulp_dist_output_images'
      modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
        // modify image url before prepend or append
        // the imgInfo param is object, {hash: 3503865059, width: 1782, height: 530, orgin_filename: 'custom.png'}
        return path.join(imageRelativeWebsiteRootPath, path.basename(imageRelativePath)); //let the relative path become an absolute path
      },
      prepend: '', // prepend string before image url
      append: '', // append string after image url
      processPath: process.cwd() // custom process path , default to process.cwd()
    }))
    .pipe(gulp.dest('tmp/'));
})
gulp.task('default',['demo']);
```

//css file content, input:
> div{background-image: url('/images/example.png');}

// output filename formats: (filename + '_' + imgWidth + '_' + imgHeight + '.' + crc32 + ext)
> div{background-image: url('/images/example_width_height.hash.png');}


## test

- npm test
- npm run cov
