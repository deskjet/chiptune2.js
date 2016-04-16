// audio context
ChiptuneAudioContext = AudioContext || webkitAudioContext;

// config
function ChiptuneJsConfig(repeatCount, context) {
  this.repeatCount = repeatCount;
  this.context = context;
}

// player
function ChiptuneJsPlayer(config) {
  this.config = config;
  this.context = config.context || new ChiptuneAudioContext;
  this.currentPlayingNode = null;
  this.handlers = [];
}

// event handlers section
ChiptuneJsPlayer.prototype.fireEvent = function (eventName, response) {
  var  handlers = this.handlers;
  if (handlers.length) {
    handlers.forEach(function (handler) {
      if (handler.eventName === eventName) {
        handler.handler(response);
      }
    })
  }
}

ChiptuneJsPlayer.prototype.addHandler = function (eventName, handler) {
  this.handlers.push({eventName: eventName, handler: handler});
}

ChiptuneJsPlayer.prototype.onEnded = function (handler) {
  this.addHandler('onEnded', handler);
}

ChiptuneJsPlayer.prototype.onError = function (handler) {
  this.addHandler('onError', handler);
}

// metadata
ChiptuneJsPlayer.prototype.duration = function() {
  return Module._openmpt_module_get_duration_seconds(this.currentPlayingNode.modulePtr);
}

ChiptuneJsPlayer.prototype.metadata = function() {
  var data = {};
  var keys = Module.Pointer_stringify(Module._openmpt_module_get_metadata_keys(this.currentPlayingNode.modulePtr)).split(';');
  var keyNameBuffer = 0;
  for (var i = 0; i < keys.length; i++) {
    keyNameBuffer = Module._malloc(keys[i].length + 1);
    Module.writeStringToMemory(keys[i], keyNameBuffer);
    data[keys[i]] = Module.Pointer_stringify(Module._openmpt_module_get_metadata(player.currentPlayingNode.modulePtr, keyNameBuffer));
    Module._free(keyNameBuffer);
  }
  return data;
}

// playing, etc
ChiptuneJsPlayer.prototype.load = function(input, callback) {
  var player = this;
  if (input instanceof File) {
    var reader = new FileReader();
    reader.onload = function() {
      return callback(reader.result); // no error
    }.bind(this);
    reader.readAsArrayBuffer(input);
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', input, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (xhr.status === 200) {
        return callback(xhr.response); // no error
      } else {
        player.fireEvent('onError', {type: 'onxhr'});
      }
    }.bind(this);
    xhr.onerror = function() {
      player.fireEvent('onError', {type: 'onxhr'});
    };
    xhr.onabort = function() {
      player.fireEvent('onError', {type: 'onxhr'});
    };
    xhr.send();
  }
}

ChiptuneJsPlayer.prototype.play = function(buffer) {
  this.stop();
  var processNode = this.createLibopenmptNode(buffer, this.config);
  if (processNode == null) {
    return;
  }

  // set config options on module
  Module._openmpt_module_set_repeat_count(processNode.modulePtr, this.config.repeatCount);

  this.currentPlayingNode = processNode;
  processNode.connect(this.context.destination);
}

ChiptuneJsPlayer.prototype.stop = function() {
  if (this.currentPlayingNode != null) {
    this.currentPlayingNode.disconnect();
    this.currentPlayingNode.cleanup();
    this.currentPlayingNode = null;
  }
}

ChiptuneJsPlayer.prototype.togglePause = function() {
	if (this.currentPlayingNode != null) {
    this.currentPlayingNode.togglePause();
  }
}

ChiptuneJsPlayer.prototype.createLibopenmptNode = function(buffer, config) {
  // TODO error checking in this whole function

  var maxFramesPerChunk = 4096;
  var processNode = this.context.createScriptProcessor(0, 0, 2);
  processNode.config = config;
  processNode.player = this;
  var byteArray = new Int8Array(buffer);
  var ptrToFile = Module._malloc(byteArray.byteLength);
  Module.HEAPU8.set(byteArray, ptrToFile);
  processNode.modulePtr = Module._openmpt_module_create_from_memory(ptrToFile, byteArray.byteLength, 0, 0, 0);
  processNode.paused = false;
  processNode.leftBufferPtr  = Module._malloc(4 * maxFramesPerChunk);
  processNode.rightBufferPtr = Module._malloc(4 * maxFramesPerChunk);
  processNode.cleanup = function() {
    if (this.modulePtr != 0) {
      Module._openmpt_module_destroy(this.modulePtr);
      this.modulePtr = 0;
    }
    if (this.leftBufferPtr != 0) {
      Module._free(this.leftBufferPtr);
      this.leftBufferPtr = 0;
    }
    if (this.rightBufferPtr != 0) {
      Module._free(this.rightBufferPtr);
      this.rightBufferPtr = 0;
    }
  }
  processNode.stop = function() {
    this.disconnect();
    this.cleanup();
  }
  processNode.pause = function() {
    this.paused = true;
  }
  processNode.unpause = function() {
    this.paused = false;
  }
  processNode.togglePause = function() {
    this.paused = !this.paused;
  }
  processNode.onaudioprocess = function(e) {
    var outputL = e.outputBuffer.getChannelData(0);
    var outputR = e.outputBuffer.getChannelData(1);
    var framesToRender = outputL.length;
    if (this.ModulePtr == 0) {
      for (var i = 0; i < framesToRender; ++i) {
        outputL[i] = 0;
        outputR[i] = 0;
      }
      this.disconnect();
      this.cleanup();
      return;
    }
    if (this.paused) {
      for (var i = 0; i < framesToRender; ++i) {
        outputL[i] = 0;
        outputR[i] = 0;
      }
      return;
    }
    var framesRendered = 0;
    var ended = false;
    var error = false;
    while (framesToRender > 0) {
      var framesPerChunk = Math.min(framesToRender, maxFramesPerChunk);
      var actualFramesPerChunk = Module._openmpt_module_read_float_stereo(this.modulePtr, this.context.sampleRate, framesPerChunk, this.leftBufferPtr, this.rightBufferPtr);
      if (actualFramesPerChunk == 0) {
        ended = true;
        // modulePtr will be 0 on openmpt: error: openmpt_module_read_float_stereo: ERROR: module * not valid or other openmpt error
        error = !this.modulePtr;
      }
      var rawAudioLeft = Module.HEAPF32.subarray(this.leftBufferPtr / 4, this.leftBufferPtr / 4 + actualFramesPerChunk);
      var rawAudioRight = Module.HEAPF32.subarray(this.rightBufferPtr / 4, this.rightBufferPtr / 4 + actualFramesPerChunk);
      for (var i = 0; i < actualFramesPerChunk; ++i) {
        outputL[framesRendered + i] = rawAudioLeft[i];
        outputR[framesRendered + i] = rawAudioRight[i];
      }
      for (var i = actualFramesPerChunk; i < framesPerChunk; ++i) {
        outputL[framesRendered + i] = 0;
        outputR[framesRendered + i] = 0;
      }
      framesToRender -= framesPerChunk;
      framesRendered += framesPerChunk;
    }
    if (ended) {
      this.disconnect();
      this.cleanup();
      error ? processNode.player.fireEvent('onError', {type: 'openmpt'}) : processNode.player.fireEvent('onEnded');
    }
  }
  return processNode;
}

