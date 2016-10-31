var stream = require('stream'),
    combine = require('stream-combiner2'),
    split = require('split2');

module.exports = progressStream;
function progressStream(total) {
  var ts = stream.Transform({ objectMode: true });
  var startTime = 0;
  ts._transform = function (chunk, enc, cb) {
    if (!startTime) {
      startTime = Date.now();
    }

    var s = chunk.toString();
    if (s.indexOf('frame=') === 0) {
      var info = s.split('\n')[0].trim().split(/[\s\=]+/);
      var status = {};
      for (var i = 0; i < info.length; i += 2) {
        status[info[i]] = info[i+1];
      }
      if (typeof status.Lsize !== 'undefined') {
        status.size = status.Lsize;
      }
      if (total > 0) {
        status.progress = status.frame / total * 100.00;
        var elapsed = Date.now() - startTime;
        var fps = status.frame / elapsed;
        var remaining = (total - status.frame)/fps;
        status.remaining = remaining / 1000;
      }
      this.push(status);
    }
    cb();
  };
  ts._flush = function (cb) {
    cb();
  };

  return combine.obj(split(/(\r|\r?\n)/), ts);
}
