function ChiptuneJsConfig(context, samplesPerBuffer, bufferLength, repeatCount) {
  this.context = context;
  this.samplesPerBuffer = samplesPerBuffer;
  this.bufferLength = bufferLength;
  this.repeatCount = repeatCount;
}

function ChiptuneJsPlayer(config) {
  this.config = config;
  this.modulePtr;
  this.bufferFinishTime;
  this.leftBufferPtr = Module._malloc(4 * this.config.samplesPerBuffer);
  this.rightBufferPtr = Module._malloc(4 * this.config.samplesPerBuffer);
  this.pause = false;
  this.scheduledAudio = [];
  this._onended = function() {
    this.scheduledAudio.shift();
  }.bind(this);
}

ChiptuneJsPlayer.prototype._cleanup = function() {
  Module._free(this.leftBufferPtr);
  Module._free(this.rightBufferPtr);
  Module._openmpt_module_destroy(this.modulePtr);
}

ChiptuneJsPlayer.prototype._loadArrayBuffer = function(buffer) {
  var byteArray = new Int8Array(buffer);
  var ptrToFile = Module._malloc(byteArray.byteLength);
  Module.HEAPU8.set(byteArray, ptrToFile);
  return Module._openmpt_module_create_from_memory(ptrToFile, byteArray.byteLength, 0, 0, 0);
}

ChiptuneJsPlayer.prototype.load = function(input, callback) {
  if (input instanceof File) {
    var reader = new FileReader();
    reader.onload = function() {
      this.modulePtr = this._loadArrayBuffer(reader.result);
      return callback(false); // no error
    }.bind(this);
    reader.readAsArrayBuffer(input);
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', input, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(error) {
      // TODO error checking
      this.modulePtr = this._loadArrayBuffer(xhr.response);
      return callback(false); // no error
    }.bind(this);

    xhr.send();
  }
}

ChiptuneJsPlayer.prototype.play = function() {
  if (this.pause === true) {
    var pauseTime = this.config.context.currentTime;
    this.scheduledAudio.forEach(function(source) {
      source.onended = undefined;
      source.pauseTime = pauseTime;
      source.stop();
    });
    return;
  }

  // init
  if (this.bufferFinishTime === undefined) {
    this.bufferFinishTime = this.config.context.currentTime;
  }

  // this is how long the buffer will last in miliseconds
  var bufferRestTime = (this.bufferFinishTime - this.config.context.currentTime) * 1000;
  if (bufferRestTime > this.config.bufferLength) {
    // buffer is longer than needed -> wait
    setTimeout(this.play.bind(this), bufferRestTime - 2*this.config.bufferLength);
    return;
  }
  
  // read samples from lib
  var sampleCount = Module._openmpt_module_read_float_stereo(this.modulePtr, 44100, this.config.samplesPerBuffer, this.leftBufferPtr, this.rightBufferPtr);

  // no new samples -> this module is done
  if (sampleCount === 0) return this._cleanup();

  // convert lib output to Float32Array to AudioBuffer
  var rawAudioLeft = Module.HEAPF32.subarray(this.leftBufferPtr / 4, this.leftBufferPtr / 4 + sampleCount)
  var rawAudioRight = Module.HEAPF32.subarray(this.rightBufferPtr / 4, this.rightBufferPtr / 4 + sampleCount)
  var audioBuffer = this.config.context.createBuffer(2, rawAudioLeft.length, 44100);
  audioBuffer.getChannelData(0).set(rawAudioLeft);
  audioBuffer.getChannelData(1).set(rawAudioRight);

  // make an AudioSource
  var source = this.config.context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(this.config.context.destination);
  source.onended = this._onended;

  // schdule it at end of buffer
  source.start(this.bufferFinishTime);
  this.bufferFinishTime += source.buffer.duration;
  source.playFinishTime = this.bufferFinishTime; // we should save this somewhere else

  // save it for pauseing
  this.scheduledAudio.push(source);

  //setTimeout(this.play.bind(this), 0);
  this.play.bind(this)();
}

ChiptuneJsPlayer.prototype.togglePause = function() {
    this.pause = !this.pause;
    if (this.pause === false) {
      this.bufferFinishTime = this.config.context.currentTime;
      var newScheduledAudio = [];
      this.scheduledAudio.forEach(function(source, i) {
        var offset = 0;
        if (i == 0 && source.playFinishTime > source.pauseTime) {
          offset = source.playFinishTime - source.pauseTime;
        }
        var newSource = this.config.context.createBufferSource();
        newSource.buffer = source.buffer;
        newSource.connect(this.config.context.destination);
        newSource.onended = function() {
          newScheduledAudio.shift();
        }.bind(this);
        newSource.start(this.bufferFinishTime, offset);
        this.bufferFinishTime += newSource.buffer.duration;
        newSource.playFinishTime = this.bufferFinishTime;
        newScheduledAudio.push(newSource);
      }.bind(this));
      this.scheduledAudio = newScheduledAudio;
      this.play();
    }
}

ChiptuneJsPlayer.prototype.stop = function() {
  if (!this.pause) {
    this.togglePause()
  }
  this._cleanup();
}
