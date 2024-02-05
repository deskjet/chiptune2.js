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
# RUN sed -i "1 i\import {atob, crypto, performance} from './polyfills.js';" bin/libopenmpt.js
# instead of another import this is the tersered polyfills.js
RUN sed -i '1 i\function atob(r){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";let e,o,n,a,c,h,d,f="",i=0;r=r.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{a=t.indexOf(r.charAt(i++)),c=t.indexOf(r.charAt(i++)),h=t.indexOf(r.charAt(i++)),d=t.indexOf(r.charAt(i++)),e=a<<2|c>>4,o=(15&c)<<4|h>>2,n=(3&h)<<6|d,f+=String.fromCharCode(e),64!==h&&(f+=String.fromCharCode(o)),64!==d&&(f+=String.fromCharCode(n))}while(i<r.length);return f}const performance={now:()=>Date.now()};const crypto={getRandomValues(r){for(let t=0;t<r.length;t++)r[t]=256*Math.random()|0}};' bin/libopenmpt.js
