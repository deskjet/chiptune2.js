# Chiptune.js
#### Version 2

This is a javascript library that can play module music files. It is based on the [libopenmpt](https://lib.openmpt.org/libopenmpt) C/C++ library. To translate libopenmpt into Javascript [emscripten](https://github.com/kripken/emscripten) was used. For audio output inside the browser WebAudio API is used.

**Please note**: The compiled `libopenmpt.js` in this repository is based on an outdated version of libopenmpt. Newer versions contain bugfixes and other improvements. Download the latest version from the libopenmpt developers [here](https://lib.openmpt.org/libopenmpt/download/) and replace `libopenmpt.js.mem` and `libopenmpt.js`.  
If you prefer to compile `libopenmpt.js` yourself (to save space or make custom changes) follow the instructions in the "Development" section.

## Features

* Play all tracker formats supported by libopenmpt (including mod, xm, s3m, it)
* Simple Javascript API
* Pause/Resume
* Tested with Google Chrome and Firefox
* Play local (HTML5) and remote files (XHR)
* Stereo playback
* Module metadata
* Looping mode
 
## To do

* Playback information (e.g. position, speed, bpm)
* Mixer settings (e.g. sampling rate, resolution)
* Seekbar support
 
## Demo

See it in action [here](https://deskjet.github.io/chiptune2.js/).

Just drop a module (e.g. from [modarchive.org](https://modarchive.org)) on the demo page and enjoy.

## Development
Download the latest [emscripten](https://emscripten.org/) SDK. Follow the instructions for your OS. Make sure `emcc` and `em++` commands are available in the PATH.  
Next download and extract the libopenmpt source code (unix like) from https://lib.openmpt.org/libopenmpt/.  
Use this command inside the libopenmpt source folder to build:

    make CONFIG=emscripten

If it compiles successfully these files (and a few more) will be created in the `bin` directory:

1. `libopenmpt.js` is libopenmpt compiled to JavaScript.
2. `libopenmpt.js.mem` is the memory initialization file `libopenmpt.js` will download/require it when loaded.
3. `libopenmpt_test.js` (and `libopenmpt_test.j.mem`) is the libopenmpt test suite and can be run in NodeJS.

Only the first two files are needed for chiptune2.js.

### Building Stylesheet
The stylesheet is built with [SASS+Compass](http://compass-style.org/). To build this yourself, follow the Compass [installation instructions](http://compass-style.org/install/), then change into the chiptune2.js directory and use this command:

    compass watch

The stylesheet .css file with rebuild every time you make a change to the source file in the `sass` folder.

## Contributers (in order of appearance)
- [deskjet](https://github.com/deskjet)
- [manx](https://github.com/manxorist)
- [nyov](https://github.com/nyov)
- [DanialOaks](https://github.com/DanielOaks)
- [onikienko](https://github.com/onikienko)
- [okaybenji](https://github.com/okaybenji)
- [photonstorm](https://github.com/photonstorm)

Thanks to everyone!

## License

All code in this project is MIT (X11) licensed. The only exception are the compiled libopenmpt parts which remain under the OpenMPT project BSD license.

License text below:

>Copyright © 2013-2017 The chiptune2.js contributers.
>
>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

