# ffmpeg-progress-stream

Generate a stream of progress events from the stderr stream of ffmpeg

[![build status](https://secure.travis-ci.org/eugeneware/ffmpeg-progress-stream.png)](http://travis-ci.org/eugeneware/ffmpeg-progress-stream)

## Installation

This module is installed via npm:

``` bash
$ npm install ffmpeg-progress-stream
```

## Example Usage

Render some images into an mp4 file and see the progress stream of the
rendering process:

``` js
var ffmpegBin = require('ffmpeg-static'),
    progressStream = require('ffmpeg-progress-stream');
var params = [
  '-y',
  '-r', 30,
  '-i', './files/frames*.jpg',
  '-pix_fmt', 'yuv420p',
  '-r', 30,
  '/tmp/out.mp4'
];

var ffmpeg = spawn(ffmpegBin.path, params);
ffmpeg.stderr
  .pipe(progressStream(120))
  .on('data', console.log);

/**
  { frame: '56',
    fps: '0.0',
    q: '29.0',
    size: '58kB',
    time: '00:00:00.13',
    bitrate: '3586.4kbits/s',
    progress: 46.666666666666664,
    remaining: 0.6045714285714285 },
  { frame: '78',
    fps: '75',
    q: '29.0',
    size: '238kB',
    time: '00:00:00.86',
    bitrate: '2248.1kbits/s',
    progress: 65,
    remaining: 0.5713076923076923 },
  { frame: '99',
    fps: '64',
    q: '29.0',
    size: '405kB',
    time: '00:00:01.56',
    bitrate: '2116.6kbits/s',
    progress: 82.5,
    remaining: 0.33281818181818185 },
  { frame: '120',
    fps: '39',
    q: '-1.0',
    Lsize: '935kB',
    time: '00:00:03.93',
    bitrate: '1946.7kbits/s',
    progress: 100,
    remaining: 0 }
  { frame: '120',
    fps: '39',
    q: '-1.0',
    Lsize: '935kB',
    time: '00:00:03.93',
    bitrate: '1946.7kbits/s',
    size: '935kB',
    progress: 100,
    remaining: 0 }
*/
```

## API
### progressStream(total)

* `total` - total number of frames to expect. If this is present then the
  `progress` and `remaining` keys will be present on the progress stream.

The `data` events emitted look like this:
``` json
{ frame: '99',
    fps: '64',
    q: '29.0',
    size: '405kB',
    time: '00:00:01.56',
    bitrate: '2116.6kbits/s',
    progress: 82.5,
    remaining: 0.33281818181818185 }
```

The `progress` is a percentage, and `remaining` is an estimate of the
remaining time in seconds.

NB: The last event has a key called `Lsize` instead of `size`. This is copied
over to the `size` field for convenience.
