var expect = require('expect.js'),
    progressStream = require('..'),
    ffmpegBin = require('ffmpeg-static'),
    path = require('path'),
    spawn = require('child_process').spawn,
    concat = require('concat-stream');

describe('ffmpeg-progress-stream', function() {
  var tempVideo = path.join(__dirname, '..', 'temp', 'out.mp4');
  var pngs = path.join(__dirname, 'fixtures', 'background-%03d.jpg');

  it('should be able to report progress without a total', function(done) {
    this.timeout(0);
    var params = [
      '-y',
      '-r', 30,
      '-i', pngs,
      '-pix_fmt', 'yuv420p',
      '-r', 30,
      tempVideo
    ];

    var ffmpeg = spawn(ffmpegBin.path, params);
    var results;
    ffmpeg.stderr
      .pipe(progressStream())
      .pipe(concat(function (data) {
        results = data;
      }))
    ffmpeg.on('close', function (code) {
      if (code !== 0) return done(new Error('Non zero exit code: ' + code));
      expect(results.length).to.be.above(1);
      for (var i = 0; i < results.length - 1; i++) {
        var result = results[i];
        expect(Object.keys(result)).to.eql(
          ['frame', 'fps', 'q', 'size', 'time', 'bitrate']);
      }
      expect(Object.keys(results[results.length - 1])).to.eql(
        ['frame', 'fps', 'q', 'Lsize', 'time', 'bitrate', 'size']);
      done();
    });
  });

  it('should be able to report progress with a total', function(done) {
    this.timeout(0);
    var params = [
      '-y',
      '-r', 30,
      '-i', pngs,
      '-pix_fmt', 'yuv420p',
      '-r', 30,
      tempVideo
    ];

    var ffmpeg = spawn(ffmpegBin.path, params);
    var results;
    ffmpeg.stderr
      .pipe(progressStream(120))
      .pipe(concat(function (data) {
        results = data;
      }))
    ffmpeg.on('close', function (code) {
      if (code !== 0) return done(new Error('Non zero exit code: ' + code));
      expect(results.length).to.be.above(1);
      for (var i = 0; i < results.length - 1; i++) {
        var result = results[i];
        expect(Object.keys(result)).to.eql(
          ['frame', 'fps', 'q', 'size', 'time', 'bitrate', 'progress', 'remaining']);
      }
      expect(Object.keys(results[results.length - 1])).to.eql(
        ['frame', 'fps', 'q', 'Lsize', 'time', 'bitrate', 'size', 'progress', 'remaining']);
      done();
    });
  });

  it('should be able to report a frame count', function(done) {
    this.timeout(0);
    var frameCountVideo = path.join(__dirname, 'fixtures', 'frame-count.mp4');
    var params = [
      '-i', frameCountVideo,
      '-f', 'null',
      '-'
    ];

    var ffmpeg = spawn(ffmpegBin.path, params);
    var results;
    ffmpeg.stderr
      .pipe(progressStream())
      .pipe(concat(function (data) {
        results = data;
      }))
    ffmpeg.on('close', function (code) {
      if (code !== 0) return done(new Error('Non zero exit code: ' + code));
      expect(results.length).to.equal(1);
      expect(results[0]).to.eql({
        frame: '15',
        fps: '0.0',
        q: '0.0',
        Lsize: 'N/A',
        time: '00:00:00.50',
        bitrate: 'N/A',
        size: 'N/A'
      });
      done();
    });
  });
});
