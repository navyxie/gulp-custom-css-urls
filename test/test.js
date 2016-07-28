var should = require('should');
var vfs = require("vinyl-fs");
var customCssUrls = require('../index');
var through2 = require("through2");
var path = require('path');
var execSync = require('exec-sync');
var testBase64Data = [
  'div {\n',
  '  background-image: url("data:image/jpeg;base64,JC");\n',
  '}'
].join('');
function dataBase64() {
    return through2.obj(function(file, encoding, cb) {
        var fileContents =  file.contents.toString();
        fileContents.should.equal(testBase64Data);
        file.contents = new Buffer(fileContents);
        this.push(file);
        cb();
    });
}
describe('gulp-custom-css-urls', function() {
  this.timeout(8000);
  var staticfile_relative_website_rootpath =  'test/assets/';
  it('css -> should not change anything in fileContents if image url is data:base64', function () {
    vfs.src('test/assets/styles/example3.css')
      .pipe(customCssUrls())
      .pipe(dataBase64())
  });
  it('css -> should be ok if image url is relative to website root path', function (done) {
    vfs.src('test/assets/styles/example1.css')
      .pipe(customCssUrls({
        staticfile_relative_website_rootpath: staticfile_relative_website_rootpath,
        modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
          imageRelativePath.should.equal('example_1968_920.1373564769.png');
          imageRelativeWebsiteRootPath.should.equal('/images');
          imgInfo.should.have.properties({hash: 1373564769, width: 1968, height: 920, orgin_filename: 'example.png' });
          done();
          return imageRelativePath;
        }
      }))
  });
  it('css -> should be ok if image url is relative to css file path', function (done) {
    vfs.src('test/assets/styles/example2.css')
      .pipe(customCssUrls({
        staticfile_relative_website_rootpath: staticfile_relative_website_rootpath,
        modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
          imageRelativePath.should.equal('example_1968_920.1373564769.png');
          imageRelativeWebsiteRootPath.should.equal('/images');
          imgInfo.should.have.properties({hash: 1373564769, width: 1968, height: 920, orgin_filename: 'example.png' });
          setTimeout(function () {done()}, 2000);
          return imageRelativePath;
        },
        outputImage: true,
        outputImage_path: './.test_dist_img'
      }))
  });
  it('jade -> should be ok if image url is relative to website root path', function () {
    vfs.src('test/views/test.jade')
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
        // skip: ['{'],
        outputImage_path: './.test_dist_img'
      }))
      .pipe(vfs.dest('./.test_dist_jade'))
  });
  it('html -> should be ok if image url is relative to website root path', function () {
    vfs.src('test/views/test.html')
      .pipe(customCssUrls({
        staticfile_relative_website_rootpath: staticfile_relative_website_rootpath,
        modify: function (imageRelativePath, cssFilePath, imageRelativeWebsiteRootPath, imgInfo) {
          imageRelativePath.should.equal('example_1968_920.1373564769.png');
          imageRelativeWebsiteRootPath.should.equal('/images');
          imgInfo.should.have.properties({hash: 1373564769, width: 1968, height: 920, orgin_filename: 'example.png' });
          return path.join(imageRelativeWebsiteRootPath, imageRelativePath);
        },
        outputImage: true,
        ext: 'html',
        outputImage_path: './.test_dist_img'
      }))
      .pipe(vfs.dest('./.test_dist_jade'))
  });
  after(function(done){
    setTimeout(function () {
      execSync("rm -r " + path.join(process.cwd(), './.test_dist_img'));
      execSync("rm -r " + path.join(process.cwd(), './.test_dist_jade'));
      done();
    },5000);
  })
});