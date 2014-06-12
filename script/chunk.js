// https://html5-demos.appspot.com/static/media-source.html
var FILE = 'trans.webm';
var NUM_CHUNKS = 5;
var video = document.querySelector('video');

window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available');
}

var mediaSource = new MediaSource();

video.src = window.URL.createObjectURL(mediaSource);

var urls = [];

mediaSource.addEventListener('sourceopen', function(e) {

  //var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
  var sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');

  logger.log('mediaSource readyState: ' + this.readyState);

  load_playlist('/msfc/Nasa-webm.m3u8', function(playlist_urls) {
    urls = playlist_urls;
    get_and_play();
  });

  var first = true;

  var get_and_play = function() {
    // Make sure the previous append is not still pending.
    if (mediaSource.sourceBuffers[0].updating) {
      logger.log('still appending')
      return;
    }

    if (urls.length == 0) {
      return;
    }
    logger.log(urls);

    var buffer = 0;

    GET(urls[0], function(uInt8Array) {
      var file = new Blob([uInt8Array], {type: 'video/webm'});

      var reader = new FileReader();

      // Reads aren't guaranteed to finish in the same order they're started in,
      // so we need to read + append the next chunk after the previous reader
      // is done (onload is fired).
      reader.onload = function(e) {
        console.log(first);
        if (first) {
          sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
          first = false;
        } else {
          var newSourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
          newSourceBuffer.appendStream(new Uint8Array(e.target.result));
          buffer += 1;
          //urls = [];
        }
        if (video.paused) {
          video.play(); // Start playing after 1st chunk is appended.
        }

        urls = urls.slice(1);
        get_and_play();
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // video.addEventListener('progress', function(e) {
  // });


}, false);

mediaSource.addEventListener('sourceended', function(e) {
  logger.log('mediaSource readyState: ' + this.readyState);
}, false);

function load_playlist(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', function(e) {

    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    var regex = /^[^#].*$/mg;
    var urls = [];
    var result;
    while ((result = regex.exec(xhr.response))) {
      urls.push(result[0]);
    }
    console.log('Playlist loaded');
    callback(urls);
  });
  xhr.addEventListener('error', function() {
    console.log('Playlist load error');
  });
  xhr.open("GET", url);
  xhr.send();
}

function GET(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function(e) {
    if (xhr.status != 200) {
      alert("Unexpected status code " + xhr.status + " for " + url);
      return false;
    }
    callback(new Uint8Array(xhr.response));
  };
}

function Logger(id) {
  this.el = document.getElementById('log');
}
Logger.prototype.log = function(msg) {
  var fragment = document.createDocumentFragment();
  fragment.appendChild(document.createTextNode(msg));
  fragment.appendChild(document.createElement('br'));
  this.el.appendChild(fragment);
};

Logger.prototype.clear = function() {
  this.el.textContent = '';
};

var logger = new Logger('log');