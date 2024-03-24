# relases:		https://lib.openmpt.org/files/libopenmpt/src/libopenmpt-0.7.4+release.makefile.tar.gz
# autobuilds:	https://builds.openmpt.org/builds/auto/libopenmpt/src.makefile/0.7.5-pre.0/libopenmpt-0.7.5-pre.0+r20329.makefile.tar.gz
#				https://builds.openmpt.org/builds/auto/libopenmpt/src.makefile/0.8.0-pre.4/libopenmpt-0.8.0-pre.4+r20328.makefile.tar.gz
docker build --build-arg BASE=https://lib.openmpt.org/files/libopenmpt/src/ --build-arg FILE=libopenmpt-0.7.6+release -t emscripten:libopenmpt . && \
docker create --name mpt emscripten:libopenmpt && \
docker cp mpt:/src/libopenmpt/bin/libopenmpt.js ../libopenmpt.worklet.js && \
docker rm mpt && \
docker rmi emscripten:libopenmpt
docker rmi emscripten/emsdk:latest

cd ..
npm run minify
brotli -f *.min.js libopenmpt.worklet.js
