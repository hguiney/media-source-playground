var video = document.getElementById('v');
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
var mediaSource = new MediaSource();
window.setTimeout(function() {
  mediaSource.addEventListener('sourceopen', onSourceOpen.bind(this, video));
  video.src = window.URL.createObjectURL(mediaSource);
}, 1000);