# 3.1.51 worked
FROM emscripten/emsdk:latest

# update / install
RUN apt update -y && apt upgrade -y && apt install pkg-config -y

# download
RUN wget https://lib.openmpt.org/files/libopenmpt/src/libopenmpt-0.7.3+release.makefile.tar.gz

# unpack
RUN tar xzvf libopenmpt-0.7.3+release.makefile.tar.gz && rm libopenmpt-0.7.3+release.makefile.tar.gz

WORKDIR /src/libopenmpt-0.7.3+release

# next line updates EXPORTED_FUNCTIONS
RUN sed -i "s/'_malloc','_free'/'_malloc','_free','stackAlloc','stackSave','stackRestore','UTF8ToString'/g" build/make/config-emscripten.mk

# build
RUN make CONFIG=emscripten EMSCRIPTEN_TARGET=audioworkletprocessor

# not sure if you have sed by hand on windows, so i add the IMPORT for polyfills here
RUN sed -i "1 i\import {atob, crypto, performance} from './polyfills.js';" bin/libopenmpt.js
