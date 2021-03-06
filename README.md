# gulp-custom-css-urls

[![Build Status via Travis CI](https://travis-ci.org/navyxie/gulp-custom-css-urls.svg?branch=master)](https://travis-ci.org/navyxie/gulp-custom-css-urls) [![Coverage Status](https://coveralls.io/repos/github/navyxie/gulp-custom-css-urls/badge.svg?branch=master)](https://coveralls.io/github/navyxie/gulp-custom-css-urls?branch=master)

a plugin for gulp to custom you image url inline css file, and support output image file, then you can upload image file to Cloud CDN.

## usage

```js
var customCssUrls = require('gulp-custom-css-urls');
var gulp = require('gulp');
var path = require('path');
gulp.task('cssDemo',function(){
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
});
gulp.task('jadeDemo',function() {
  return gulp.src('views/test.jade')
    .pipe(customCssUrls({
      staticfile_relative_website_rootpath: staticfile_relative_website_rootpath,
      modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
        imageRelativePath.should.equal('example_1968_920.1373564769.png');
        imageRelativeWebsiteRootPath.should.equal('/images');
        imgInfo.should.have.properties({hash: 1373564769, width: 1968, height: 920, orgin_filename: 'example.png' });
        return path.join(imageRelativeWebsiteRootPath, imageRelativePath);
      },
      outputImage: true,
      ext: 'jade',
      outputImage_path: './.test_dist_img'
    }))
});

//rollback template content
gulp.task('returnToOrigin', function() {
  return gulp.src('views/forcemodify.html')
    .pipe(customCssUrls({
      forceModify: function (imageUrl, filePath) {
        var qiniu_host = 'https://demo.com';
        var ext = path.extname(imagesUrl);
        if (!ext) {
        return imagesUrl;
        }
        return imagesUrl.replace(ext, '').replace(qiniu_host, '').replace(/_\d{1,}_\d{1,}\.\d{1,}$/, '') + ext;
      },
      ext: 'html'
    }))
    .pipe(gulp.dest('views/'))
});
gulp.task('default',['cssDemo']);
gulp.task('jade',['jadeDemo']);
gulp.task('originTemplateContent',['returnToOrigin']);
```

//css file content, input:
> div{background-image: url('/images/example.png');}

// output filename formats: (filename + '_' + imgWidth + '_' + imgHeight + '.' + crc32 + ext)
> div{background-image: url('/images/example_width_height.hash.png');}


## test

- npm test
- npm run cov

## change log

- 0.3.0

  ```
  feature support:
    image src support leftspace and rightspace.
  ```

- 0.2.2

  ```
  bug fix:
    when template contain script, and have code xxx.src=xxx, will cause bug.
  ```

- 0.2.0

  ```
  add option forceModify:
    which is a function , change url and direct return result.
  ```
  
- 0.1.0

  ```
  add option ext:
    which support css, html ,jade, default css.
  add option skip:
    which is a array, url will skip when contain character in skip array.
  ```

- 0.0.1

  ```
  only support css file.
  ```
