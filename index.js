var through2 = require('through2');
var _ = require('lodash');
var rework = require('rework');
var reworkUrl = require('rework-plugin-url');
var bufferCrc32 = require('buffer-crc32');
var imageSize = require('image-size');
var fs = require('fs');
var path = require('path');
var vfs = require('vinyl-fs');
var rename = require('gulp-rename');


// Maximum buffer size, with a default of 128 kilobytes.
// TO-DO: make this adaptive based on the initial signature of the image
var MaxBufferSize = 128*1024;
function syncFileToBuffer (filepath) {
  // read from the file, synchronously
  var descriptor = fs.openSync(filepath, 'r');
  var size = fs.fstatSync(descriptor).size;
  var bufferSize = Math.min(size, MaxBufferSize);
  var buffer = new Buffer(bufferSize);
  fs.readSync(descriptor, buffer, 0, bufferSize, 0);
  fs.closeSync(descriptor);
  return buffer;
}


function customUrls (file, options) {

  // css
  var filePath = file.path;
  var fileContents =  file.contents.toString();
  var cssDirname = path.dirname(filePath);

  // options
  var modify = options.modify; // function you can modify return url before prepend or append
  var prepend = options.prepend;
  var append = options.append;
  var outputImage = options.outputImage; // output images
  var outputImage_path = options.outputImage_path || './.gulp_dist_output_images'; // output images filepath
  var relative_root = options.staticfile_relative_website_rootpath || ''; //static filepath relative absolute filepath's physical position. (eg: /images/demo.png, absoulte filepath is /Users/Navy/Desktop/code/demo/assets/images/demo.png, process.cwd() is  /Users/Navy/Desktop/code/demo, so the relative_root is assets)
  var processPath = options.processPath || process.cwd();

  // format images url inline css
  var formattedContents =  rework(fileContents).use(reworkUrl(function(url){
    var formattedUrl = url; // image origin filepath
    var imgAbsolutePath = formattedUrl; // image absolute filepath

    //if images url is data:base64 , continue
    if (formattedUrl.indexOf('data:') === 0) {
      return formattedUrl;
    }
    // if images url is netword file , continue
    if (/^(http|https|ftp|\/\/)/gi.test(formattedUrl)) {
      return formattedUrl;
    }

    // image filepath is relative to website root
    if (/^(\/)/gi.test(formattedUrl)) {
      imgAbsolutePath = path.join(processPath, relative_root, formattedUrl);
    } else {
      // image filepath is a relative path
      imgAbsolutePath = path.resolve(cssDirname, formattedUrl);
    }

    // images filename info
    var imgExt = path.extname(formattedUrl);
    var imgFileFullName = path.basename(formattedUrl);
    var imgFileName = path.basename(formattedUrl, imgExt);
    // image filepath relative website root path.
    var img_relative_website_root_path = path.dirname(path.relative(relative_root, path.relative(processPath, imgAbsolutePath)));
    
    // calculate image file  crc32 value
    var crc32 = bufferCrc32.unsigned(syncFileToBuffer(imgAbsolutePath));

    // get image size info
    var imgWH = imageSize(imgAbsolutePath);

    //rename image, the format is ('imgFileName' + '_' + 'imageWidth' + '_' + 'imageHeight' + 'imageCrc32Value' + 'imageExt');
    formattedUrl = imgFileName + '_' + imgWH.width + '_' + imgWH.height + '.' + crc32 + imgExt;

    // if need to output match's images, do it.
    if (outputImage) {
      var outputBasename = path.basename(formattedUrl);
      var outputDirname = path.join(outputImage_path, img_relative_website_root_path);
      var outputFilepath = path.join(processPath, outputDirname, outputBasename);
      console.info('output image file from: ', imgAbsolutePath, ' to: ', outputFilepath);
      // copy image form imgAbsolutePath to outputFilepath
      vfs.src(imgAbsolutePath).pipe(rename({basename:path.basename(outputFilepath, imgExt)})).pipe(vfs.dest(path.dirname(outputFilepath)));
    }

    // mofify url
    if (_.isFunction(modify)) {
      formattedUrl = modify(formattedUrl, filePath, '/' + img_relative_website_root_path, {hash: crc32, width: imgWH.width, height: imgWH.height, orgin_filename: imgFileFullName});
    }

    // prepend string
    if (typeof prepend === 'string') {
      formattedUrl = prepend + formattedUrl;
    }

    // append string
    if (typeof append === 'string') {
      formattedUrl += append;
    }

    return formattedUrl;

  })).toString();
  return formattedContents;
};

module.exports = function (options) {
  if (!_.isObject(options)) {
    options = {};
  }
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }
    var customedContents = customUrls(file, options);
    file.contents = new Buffer(customedContents);
    this.push(file);
    return cb();
  });
}