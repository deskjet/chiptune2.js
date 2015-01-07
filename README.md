#Chiptune.js
#### Version 2

This is a javascript library that can play module music files. It is based on the [libopenmpt](http://lib.openmpt.org/libopenmpt) C/C++ library. To translate libopenmpt into Javascript [emscripten](https://github.com/kripken/emscripten) was used. For audio output inside the browser WebAudio API ist used.


## Features

* Play all traker formats supported by libopenmpt (including mod, xm, s3m, it)
* Simple Javascript API
* Pause/Resume
* Tested with Google Chrome and Firefox
* Play local (HTML5) and remote files (XHR)
* Stereo playback
* Module metadata
 
## To do

* Looping mode
* Playback information (e.g. position, speed, bpm)
* Mixer settings (e.g. sampling rate, resolution)
* Seekbar support
 
## Demo

See it in action [here](http://deskjet.github.io/chiptune2.js/).

Just drop a module (e.g. from [modarchive.org](http://modarchive.org)) on the demo page and enjoy.

## Development
To compile libopenmpt to javascript you need a recent version of [emscripten](https://github.com/kripken/emscripten). Take a look at thier wiki for building instructions. Make sure you have it setup correctly and `emcc` is in your PATH.  
With emscripten ready you should get a copy of libopenmpt. Go to [thier website](http://lib.openmpt.org/libopenmpt/), download the latest snapshot and extract it.  
Now you're ready to build. Use this command:

    make CONFIG=emscripten

If it runs successfully two file will be created inside the `bin` directory.  

1. `libopenmpt.js` is the library you want. You can use it with chiptune2.js.
2. `libopenmpt_test.js` is the libopenmpt test suite. It is meant to run in nodejs.

### Building Stylesheet
The stylesheet is build with [SASS+Compass](http://compass-style.org/). To build this yourself, follow the Compass [installation instructions](http://compass-style.org/install/), then cd into the chiptune2.js directory and use this command:

    compass watch

The stylesheet .css file with rebuild every time you make a change to the source file in the `sass` folder.

## Contributions
These people helped making this project better:
- [manx](https://github.com/manxorist)
- [nyov](https://github.com/nyov)
- [DanialOaks](https://github.com/DanielOaks)

Thank You!

## License

All code in this project is MIT (X11) licensed. The only exception are the compiled libopenmpt parts which remain under the OpenMPT project BSD license.

License text below:

>Copyright © 2013-2014 Simon Gündling.
>
>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

