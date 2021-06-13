
#following example and some data from https://memememememememe.me/post/training-haar-cascades/

rm -f negatives/negatives.txt
ls -l1 negatives/*.jpg > negatives.txt

CV_APP_PATH=./bin/darwin

#apps built statically from opencv source: 
#cmake -DCMAKE_BUILD_TYPE=DEBUG -DBUILD_opencv_apps=ON -DBUILD_SHARED_LIBS=OFF ../opencv

rm -rf samples/samples.txt
mkdir -p samples

${CV_APP_PATH}/opencv_createsamples \
-img positives/cropped00.jpg \
-bg negatives.txt \
-info samples/samples.txt \
-num 128 -w 48 -h 30