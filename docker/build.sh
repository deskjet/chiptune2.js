docker build -t emscripten:libopenmpt . && \
docker create --name mpt emscripten:libopenmpt && \
docker cp mpt:/src/libopenmpt-0.7.3+release/bin/libopenmpt.js ../libopenmpt.worklet.js && \
docker rm mpt && \
docker rmi emscripten:libopenmpt
#docker rmi emscripten/emsdk:latest
