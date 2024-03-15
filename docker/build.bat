docker build --build-arg BASE=https://lib.openmpt.org/files/libopenmpt/src/ --build-arg FILE=libopenmpt-0.7.4+release -t emscripten:libopenmpt .
docker create --name mpt emscripten:libopenmpt
docker cp mpt:/src/libopenmpt-0.7.4+release/bin/libopenmpt.js ../libopenmpt.worklet.js
docker rm mpt
docker rmi emscripten:libopenmpt
docker rmi emscripten/emsdk:latest

cd ..
npm run minify
brotli -f *.min.js libopenmpt.worklet.js
